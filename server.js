const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// تسجيل الطلبات القادمة للمساعدة في متابعة الاتصال بتطبيق الجوال
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('ar-EG')}] ${req.method} ${req.url}`);
  next();
});

// 🔴 حط لينك الـ MongoDB Atlas بتاعك هنا بدل القوسين
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Abulmagd:Abulmagd610@cluster0.fac4uzx.mongodb.net/billing?appName=Cluster0";

// استخدام خوادم DNS العامة لحل مشكلة الاتصال بـ MongoDB Atlas عبر الراوتر المحلي
try { require('node:dns').setServers(['8.8.8.8', '8.8.4.4']); } catch(e) {}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// ================= النماذج (Models) =================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
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
  total: Number,
  paid: Number,
  remaining: Number
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

// 1. تسجيل الدخول والإنشاء
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (!user) {
    // لو المستخدم مش موجود، هنعمله حساب جديد مؤقتاً للتسهيل
    user = new User({ username, password });
    await user.save();
    return res.json({ message: 'تم إنشاء حساب جديد وتسجيل الدخول', userId: user._id });
  }
  if (user.password === password) {
    res.json({ message: 'تم تسجيل الدخول بنجاح', userId: user._id });
  } else {
    res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }
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

// 3. الفواتير (إضافة، جلب، تعديل، حذف)
app.post('/api/invoices', async (req, res) => {
  const payload = req.body;
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 السيرفر شغال ومستعد لاستقبال الطلبات على:`);
  console.log(`   - من نفس الجهاز (Localhost): http://localhost:${PORT}/api`);
  console.log(`   - من الهاتف عبر الواي فاي:    http://192.168.1.2:${PORT}/api`);
  console.log(`   - من محاكي أندرويد (Emulator): http://10.0.2.2:${PORT}/api\n`);
});