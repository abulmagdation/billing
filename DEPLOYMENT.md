# رفع RetalCare إلى GitHub وCloud Run

## مهم قبل النشر

ملف Dockerfile في جذر المشروع يبني `website` بـVite ثم يشغل Express لتقديم الموقع و`/api` من نفس الرابط. مجلد `app` القديم لا يدخل صورة Docker. قاعدة MongoDB خارج الحاوية، ولا يتم تغيير تصميم PDF أثناء النشر.

**الخدمة ليست جاهزة للوصول العام إلى بيانات حقيقية:** الـAPI الحالي لا يتحقق من جلسة المستخدم على مسارات المرضى والفواتير والتقارير، وتسجيل الدخول ينشئ مستخدمين تلقائياً وكلمات المرور غير مشفرة. أبقِ Cloud Run على **Require authentication** حتى تنفيذ حماية الـAPI وإدارة الحسابات وتشفير كلمات المرور. صفحة تسجيل الدخول وحدها ليست حماية للسيرفر.

تم نقل رابط MongoDB المكتوب في الكود إلى `server/.env` المحلي المستثنى من Git وDocker. كذلك استُثني `app/archive` من Git لأنه يحتوي نسخاً تاريخية فيها بيانات اتصال؛ بقيت النسخ محلياً دون حذف. إذا سبق مشاركة الرابط أو رفعه، غيّر كلمة مرور مستخدم MongoDB Atlas. لا تضع الرابط في README أو أوامر Git أو متغير `VITE_*`؛ تلك المتغيرات تظهر في ملفات المتصفح.

## 1. ارفع على GitHub

من GitHub أنشئ repository **Private** وفارغاً، دون README أو gitignore تلقائي. افتح PowerShell في جذر المشروع، واستبدل `YOUR_USERNAME` و`YOUR_REPO` بالقيم الحقيقية:

```powershell
cd D:\patient-billing
git status
git add -A
git diff --cached --stat
git diff --cached --name-only
git commit -m "Prepare RetalCare website and Cloud Run deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

المشروع بالفعل مهيأ بـGit؛ لا تحتاج `git init`. وقت الإعداد لم توجد commits أو remote. إذا أضفت remote بنفسك لاحقاً، افحص `git remote -v` بدلاً من تكرار `remote add`. راجع الملفات قبل commit، ويجب ألا تجد `.env` أو `node_modules` أو بيانات مرضى حقيقية. تسجيل الدخول إلى GitHub يتم من مدير بيانات اعتماد Git/المتصفح، وليس بكلمة مرور الحساب داخل الأمر.

لرفع تعديلات لاحقة:

```powershell
git add -A
git commit -m "Update RetalCare"
git push
```

## 2. إعداد أسرار واتصال قاعدة البيانات

1. فعّل Billing وواجهات Cloud Run وCloud Build وArtifact Registry وSecret Manager في مشروع Google Cloud.
2. أنشئ Secret باسم `retalcare-mongo-uri` وضع فيه رابط MongoDB الصحيح، باستخدام Console وليس الكود. اربط نسخة محددة مثل `1` بمتغير البيئة `MONGO_URI`.
3. امنح حساب الخدمة الذي سيشغل Cloud Run صلاحية `Secret Manager Secret Accessor` على هذا السر فقط. امنح حساب البناء صلاحيات النشر المطلوبة عندما يطلبها معالج Cloud Run.
4. اضبط MongoDB Atlas Network Access ليتاح الوصول من Cloud Run. عنوان الخروج ليس ثابتاً افتراضياً: للاتصال المقيد استخدم إعداد VPC وCloud NAT بعنوان خروج ثابت وأضفه لقائمة Atlas. لا تفتح القاعدة لكل الإنترنت لمجرد تجاوز مشكلة الاتصال. الإعداد الشبكي قد تكون له تكلفة إضافية.
5. اترك `RUN_INVOICE_MIGRATION=false`. الترحيل القديم أصبح اختيارياً لكي لا يعاد تعديل البيانات تلقائياً مع تشغيل كل نسخة Cloud Run. أي ترحيل لاحق يحتاج نسخة احتياطية ونافذة صيانة.

## 3. ربط GitHub بـCloud Run

في Google Cloud Console افتح Cloud Run ثم Create service واختر النشر المستمر من repository باستخدام Cloud Build:

- Provider: GitHub، ثم اختر الـrepo الذي رفعته.
- Branch: `^main$`.
- Build type: **Dockerfile**.
- Source/build context directory: جذر الـrepository (`.`).
- Dockerfile path: `Dockerfile` في الجذر، وليس داخل website أو server.
- Container port: `8080` (التطبيق يقرأ `PORT` الذي توفره Cloud Run).
- اسم مقترح للخدمة: `retalcare`، واختر المنطقة المناسبة لك.
- اترك command وarguments فارغين لاستخدام CMD في Dockerfile.
- في Variables & Secrets أضف `MONGO_URI` من Secret Manager، نسخة `1` أو رقم النسخة الفعلي.
- Authentication: **Require authentication**. لا تختر Allow unauthenticated الآن.

بعد الحفظ تابع Build logs وRevision logs. كل push إلى main يشغّل البناء والنشر. لا تحتاج خدمة Vite development server أو خدمة frontend منفصلة، ولا تحتاج ضبط `VITE_API_URL` لأن `/api` يعمل من نفس النطاق.

للمعاينة وأنت مخول بصلاحية Cloud Run Invoker استخدم Google Cloud CLI:

```powershell
gcloud auth login
gcloud run services proxy retalcare --project YOUR_PROJECT_ID --region YOUR_REGION --port 8080
```

افتح `http://localhost:8080`. الوصول المباشر للرابط الخاص قد يعرض 403 من دون هوية Google Cloud؛ هذه الحماية مقصودة وليست مشكلة في الموقع.

## 4. اختبار Docker محلياً (يتطلب Docker Desktop)

```powershell
docker build -t retalcare .
docker run --rm -p 8080:8080 --env-file server/.env -e PORT=8080 retalcare
```

افتح `http://localhost:8080`. الأمر يضبط منفذ الحاوية على 8080 حتى لو كانت إعداداتك المحلية تستخدم 5000. تشغيل السيرفر بهذا الأمر يتصل بقاعدة البيانات الفعلية المحددة في الملف؛ استخدم قاعدة اختبار عند التجربة.

اختبار تقديم الموقع بدون الاتصال بقاعدة بيانات:

```powershell
npm --prefix website ci
npm --prefix server ci
npm run build
node --test server/hosting.test.js
```

`/healthz` هو فحص حياة عملية HTTP فقط، وليس فحص جاهزية قاعدة البيانات. يفشل تشغيل السيرفر عند عدم وجود MONGO_URI أو فشل الاتصال الأولي. `/api` غير معروف يرجع 404 JSON ولا يرجع صفحة React.

## المصادر الرسمية

- [متطلبات حاوية Cloud Run](https://docs.cloud.google.com/run/docs/container-contract)
- [النشر المستمر من GitHub](https://docs.cloud.google.com/run/docs/continuous-deployment)
- [ربط Secret Manager بالخدمة](https://docs.cloud.google.com/run/docs/configuring/services/secrets)
