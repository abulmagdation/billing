const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const { mountWebsite } = require('./hosting');

const app = express();
app.use(express.json());
app.use(cors());

// تسجيل الطلبات القادمة للمساعدة في متابعة الاتصال بتطبيق الجوال
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('ar-EG')}] ${req.method} ${req.url}`);
  next();
});

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is required. Set server/.env locally or a Cloud Run secret.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('MongoDB connected'))
  .catch(() => {
    console.error('MongoDB connection failed. Check MONGO_URI and network access.');
    process.exit(1);
  });

const migrateOldInvoices = async () => {
  try {
    const InvoiceModel = mongoose.model('Invoice');
    const invoices = await InvoiceModel.find();
    console.log(`🔄 جاري فحص وترقية ${invoices.length} فاتورة قديمة...`);
    let updatedCount = 0;

    for (let index = 0; index < invoices.length; index++) {
      const inv = invoices[index];
      let needsSave = false;

      if (!inv.date || isNaN(Date.parse(inv.date))) {
        inv.date = inv._id.getTimestamp ? inv._id.getTimestamp().toISOString() : new Date().toISOString();
        needsSave = true;
      }

      if (!inv.invoiceId) {
        inv.invoiceId = 'INV-' + (1000 + index);
        needsSave = true;
      }

      if (typeof inv.notes !== 'string') {
        inv.notes = '';
        needsSave = true;
      }

      const total = Number(inv.total) || 0;
      const paid = Number(inv.paid) || 0;
      const calcRemaining = Math.max(0, total - paid);
      if (inv.total !== total || inv.paid !== paid || inv.remaining !== calcRemaining) {
        inv.total = total;
        inv.paid = paid;
        inv.remaining = calcRemaining;
        needsSave = true;
      }

      if (Array.isArray(inv.services)) {
        inv.services = inv.services.map((s, idx) => ({
          ...s,
          id: s.id || `srv_${idx}_${Date.now()}`,
          name: s.name || s.serviceName || 'بند / خدمة',
          quantity: Number(s.quantity) || 1,
          price: Number(s.price) || 0,
          total: Number(s.total) || ((Number(s.quantity) || 1) * (Number(s.price) || 0)),
          date: s.date && !isNaN(Date.parse(s.date)) ? s.date : inv.date
        }));
        needsSave = true;
      } else {
        inv.services = [];
        needsSave = true;
      }

      if (needsSave) {
        await inv.save();
        updatedCount++;
      }
    }
    console.log(`✅ اكتمل تحديث ${updatedCount} فاتورة قديمة بنجاح!`);
  } catch (err) {
    console.error('❌ خطأ أثناء ترقية الفواتير القديمة:', err);
  }
};

mongoose.connection.once('open', () => {
  if (process.env.RUN_INVOICE_MIGRATION === 'true') setTimeout(migrateOldInvoices, 2000);
});

// ================= النماذج (Models) =================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, default: '' },
  deviceKey: { type: String, default: 'RETAL_SECURE_99' }
});
const User = mongoose.model('User', UserSchema);

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['patient', 'entity'], default: 'patient' },
  createdAt: { type: String, default: () => new Date().toLocaleDateString('ar-EG') }
});
const Patient = mongoose.model('Patient', PatientSchema);

const InvoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  invoiceId: { type: String },
  date: String,
  services: Array,
  sections: { type: [{ id: String, title: String, _id: false }], default: undefined },
  total: Number,
  paid: Number,
  remaining: Number,
  notes: { type: String, default: '' }
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);

const ReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  date: { type: String },
  content: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
});
const Report = mongoose.model('Report', ReportSchema);

// ================= المسارات (Routes) =================

// 1. تسجيل الدخول والإنشاء وتوليد التوكن
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, password });
  } else if (user.password !== password) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  const newToken = `TK_${user.deviceKey || 'RETAL_SECURE_99'}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  user.token = newToken;
  await user.save();

  res.json({ message: 'تم تسجيل الدخول بنجاح', userId: user._id, token: newToken });
});

// 1.1 التحقق من التوكن عند فتح التطبيق
app.post('/api/auth/verify-token', async (req, res) => {
  const { token, userId } = req.body;
  if (!token || !userId) {
    return res.status(401).json({ valid: false, error: 'التوكن غير موجود' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.token) {
      return res.status(401).json({ valid: false, error: 'المستخدم أو التوكن غير موجود بالداتا بيز' });
    }

    const currentDeviceKey = user.deviceKey || 'RETAL_SECURE_99';
    if (user.token === token && user.token.includes(currentDeviceKey)) {
      return res.json({ valid: true, userId: user._id, username: user.username });
    }

    return res.status(401).json({ valid: false, error: 'تم إنهاء الجلسة أو تغيير التوكن من الداتا بيز' });
  } catch (err) {
    return res.status(500).json({ valid: false, error: 'خطأ في السيرفر' });
  }
});

// 1.2 تسجيل الخروج ومسح التوكن من الداتا بيز
app.post('/api/auth/logout', async (req, res) => {
  const { userId } = req.body;
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, { token: '' });
    } catch (e) {}
  }
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// 2. إضافة والبحث عن المرضى
app.post('/api/patients', async (req, res) => {
  const newPatient = new Patient({ name: req.body.name, type: req.body.type || 'patient' });
  await newPatient.save();
  res.json(newPatient);
});

app.get('/api/patients', async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let query = {};
  if (search) {
    query = { name: { $regex: search, $options: 'i' } };
  }
  
  const patients = await Patient.find(query).sort({ _id: -1 }).skip(skip).limit(parseInt(limit));
  res.json(patients);
});

app.put('/api/patients/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid patient ID / معرف غير صحيح' });
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const type = req.body.type;
  if (!name || !['patient', 'entity'].includes(type)) return res.status(400).json({ error: 'Name and valid type required / الاسم ونوع الملف مطلوبان' });
  const patient = await Patient.findByIdAndUpdate(req.params.id, { $set: { name, type } }, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ error: 'Patient not found / الملف غير موجود' });
  res.json(patient);
});

// 3. الفواتير (إضافة، جلب، تعديل، حذف)
app.post('/api/invoices', async (req, res) => {
  const payload = req.body;
  if (payload.sections !== undefined) {
    if (!Array.isArray(payload.sections) || !payload.sections.length || payload.sections.some(s => !s || typeof s.id !== 'string' || !s.id || typeof s.title !== 'string' || !s.title.trim()) || new Set(payload.sections.map(s => s.id)).size !== payload.sections.length) return res.status(400).json({ error: 'Invalid invoice sections / أقسام الفاتورة غير صحيحة' });
    if (!Array.isArray(payload.services) || !payload.services.length || payload.services.some(s => !payload.sections.some(section => section.id === s.sectionId) || !Number.isFinite(Date.parse(s.date)))) return res.status(400).json({ error: 'Invalid section or date / قسم أو تاريخ غير صحيح' });
    payload.sections = payload.sections.map(s => ({ id: s.id, title: s.title.trim() }));
    payload.services = payload.sections.flatMap(section => payload.services.filter(s => s.sectionId === section.id).sort((a,b) => Date.parse(a.date)-Date.parse(b.date)));
  }
  if (!payload.invoiceId) {
    payload.invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
  }
  const invoice = new Invoice(payload);
  await invoice.save();
  res.json(invoice);
});

app.get('/api/invoices/:patientId', async (req, res) => {
  const invoices = await Invoice.find({ patientId: req.params.patientId }).sort({ _id: -1 });
  res.json(invoices);
});

app.get('/api/invoices', async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let query = {};
  if (search) {
    const patients = await Patient.find({ name: { $regex: search, $options: 'i' } });
    const patientIds = patients.map(p => p._id);

    query = {
      $or: [
        { invoiceId: { $regex: search, $options: 'i' } },
        { patientId: { $in: patientIds } }
      ]
    };
  }

  const invoices = await Invoice.find(query).sort({ _id: -1 }).skip(skip).limit(parseInt(limit)).populate('patientId');
  res.json(invoices);
});

app.delete('/api/invoices/:id', async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: 'تم الحذف' });
});

app.post('/api/invoices/migrate-old', async (req, res) => {
  await migrateOldInvoices();
  res.json({ message: 'تم تحديث وتنظيم جميع الفواتير القديمة بنجاح' });
});

// 4. التقارير الطبية (إضافة، جلب)
app.post('/api/reports', async (req, res) => {
  const payload = req.body;
  const report = new Report(payload);
  await report.save();
  res.json(report);
});

app.get('/api/reports/:patientId', async (req, res) => {
  const reports = await Report.find({ patientId: req.params.patientId }).sort({ _id: -1 });
  res.json(reports);
});

app.get('/api/reports', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reports = await Report.find({}).sort({ _id: -1 }).skip(skip).limit(parseInt(limit)).populate('patientId');
  res.json(reports);
});

app.put('/api/reports/:id', async (req, res) => {
  const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedReport);
});

app.delete('/api/reports/:id', async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  res.json({ message: 'تم الحذف' });
});

mountWebsite(app);

const PORT = process.env.PORT || 5000;
const httpServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 السيرفر شغال ومستعد لاستقبال الطلبات على:`);
  console.log(`   - من نفس الجهاز (Localhost): http://localhost:${PORT}/api`);
  console.log(`   - من الهاتف عبر الواي فاي:    http://192.168.1.4:${PORT}/api`);
  console.log(`   - من محاكي أندرويد (Emulator): http://10.0.2.2:${PORT}/api\n`);
});

process.on('SIGTERM', () => {
  httpServer.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 8000).unref();
});
