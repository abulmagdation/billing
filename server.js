const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 🔴 حط لينك الـ MongoDB Atlas بتاعك هنا بدل القوسين
const MONGO_URI = "mongodb+srv://Abulmagd:Abulmagd610@cluster0.fac4uzx.mongodb.net/billing?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch(err => console.error('خطأ في الاتصال:', err));

// ================= النماذج (Models) =================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toLocaleDateString('ar-EG') }
});
const Patient = mongoose.model('Patient', PatientSchema);

const InvoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  date: String,
  services: Array,
  total: Number,
  paid: Number,
  remaining: Number
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);

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
  const newPatient = new Patient({ name: req.body.name });
  await newPatient.save();
  res.json(newPatient);
});

app.get('/api/patients', async (req, res) => {
  const { search } = req.query;
  let query = {};
  
  if (search) {
    // لو بيبحث، هنجيبله اللي بيدور عليه
    query.name = { $regex: search, $options: 'i' };
    const patients = await Patient.find(query).sort({ _id: -1 });
    res.json(patients);
  } else {
    // لو مفيش بحث، هنجيب آخر 10 مرضى بس
    const patients = await Patient.find(query).sort({ _id: -1 }).limit(10);
    res.json(patients);
  }
});

// 3. الفواتير (إضافة، جلب، تعديل، حذف)
app.post('/api/invoices', async (req, res) => {
  const invoice = new Invoice(req.body);
  await invoice.save();
  res.json(invoice);
});

app.get('/api/invoices/:patientId', async (req, res) => {
  const invoices = await Invoice.find({ patientId: req.params.patientId }).sort({ _id: -1 });
  res.json(invoices);
});

app.delete('/api/invoices/:id', async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: 'تم الحذف' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('السيرفر شغال على بورت 5000 🚀'));
