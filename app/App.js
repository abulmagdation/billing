import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Platform, StatusBar, I18nManager, KeyboardAvoidingView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider, MD3DarkTheme, Text, TextInput, configureFonts, Divider } from 'react-native-paper';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { translations } from './src/i18n/translations';
import { GradientButton } from './src/components/GradientButton';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from './src/theme';

// إجبار التطبيق على اليمين
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// =========================================================================

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const API_URL = 'http://192.168.1.4:5000/api';

const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

const autoTranslateText = async (text, lang) => { return text; };

const formatClientName = async (name, lang) => {
  if (!name) return name;
  const isNameArabic = isArabic(name);
  if (lang === 'ar' && !isNameArabic) {
    try {
      const res = await axios.get(`https://inputtools.google.com/request?text=${encodeURIComponent(name)}&itc=ar-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`);
      if (res.data && res.data[1] && res.data[1][0] && res.data[1][0][1] && res.data[1][0][1][0]) {
        return res.data[1][0][1][0];
      }
    } catch (e) { console.log('Transliteration error', e); }
  } else if (lang === 'en' && isNameArabic) {
    return name;
  }
  return name;
};

const TranslatedText = ({ text, lang, isName, style }) => {
  const [displayText, setDisplayText] = React.useState(text);
  React.useEffect(() => {
    let isMounted = true;
    const updateText = async () => {
      if (isName && text) {
        const translated = await formatClientName(text, lang);
        if (isMounted) setDisplayText(translated);
      } else {
        if (isMounted) setDisplayText(text);
      }
    };
    updateText();
    return () => { isMounted = false; };
  }, [text, lang, isName]);
  return <Text style={style}>{displayText}</Text>;
};

const COMPANY_LOGO_BASE64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 130" width="400" height="130"><defs><linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231E3A8A"/><stop offset="100%" stop-color="%233B82F6"/></linearGradient><linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233B82F6"/><stop offset="100%" stop-color="%2360A5FA"/></linearGradient><filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="%23000" flood-opacity="0.08"/></filter></defs><g filter="url(%23subtleShadow)"><rect x="15" y="15" width="85" height="85" rx="24" fill="url(%23primaryGrad)"/><path d="M 45 33 C 45 30 70 30 70 33 C 70 52 45 55 45 77 C 45 82 70 82 70 77" fill="none" stroke="%23FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="70" cy="33" r="5.5" fill="%2360A5FA"/><circle cx="45" cy="77" r="5.5" fill="%2360A5FA"/><path d="M 33 57.5 L 82 57.5" fill="none" stroke="url(%23accentGrad)" stroke-width="7.5" stroke-linecap="round"/></g><text x="120" y="62" font-family="'Cairo', sans-serif" font-weight="900" font-size="36" fill="%231E3A8A" letter-spacing="-0.5">رتال كير</text><text x="122" y="86" font-family="'Cairo', sans-serif" font-weight="700" font-size="16" fill="%233B82F6" letter-spacing="1">RETAL CARE</text><text x="122" y="104" font-family="'Cairo', sans-serif" font-weight="600" font-size="12" fill="%2364748B">للمستلزمات والأجهزة الطبية</text></svg>`;

const STAMP_BASE64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="stampGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231E3A8A"/><stop offset="100%" stop-color="%232563EB"/></linearGradient></defs><circle cx="100" cy="100" r="92" fill="none" stroke="url(%23stampGrad)" stroke-width="5" stroke-dasharray="12,4"/><circle cx="100" cy="100" r="82" fill="none" stroke="url(%23stampGrad)" stroke-width="2"/><path id="circlePathTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none"/><text font-family="'Cairo', sans-serif" font-size="14" font-weight="800" fill="%231E3A8A"><textPath href="%23circlePathTop" startOffset="50%" text-anchor="middle">شركة رتال كير الطبية</textPath></text><path id="circlePathBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none"/><text font-family="'Cairo', sans-serif" font-size="12" font-weight="700" fill="%232563EB"><textPath href="%23circlePathBottom" startOffset="50%" text-anchor="middle">RETAL CARE MEDICAL CO.</textPath></text><circle cx="100" cy="100" r="50" fill="none" stroke="%233B82F6" stroke-width="1.5" stroke-dasharray="4,2"/><g transform="translate(100, 100) scale(0.65) translate(-40, -40)"><path d="M 25 15 C 25 12 55 12 55 15 C 55 34 25 37 25 59 C 25 64 55 64 55 59" fill="none" stroke="%231E3A8A" stroke-width="7" stroke-linecap="round"/><path d="M 15 37 L 65 37" fill="none" stroke="%232563EB" stroke-width="6" stroke-linecap="round"/></g><path d="M 45,100 L 55,100 M 145,100 L 155,100" stroke="%231E3A8A" stroke-width="3" stroke-linecap="round"/><text x="100" y="142" font-family="'Cairo', sans-serif" font-size="12" font-weight="900" fill="%231E3A8A" text-anchor="middle">معتمد / APPROVED</text></svg>`;

const formatDate = (isoString, lang) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const generateInvoicePDF = async (invoiceData, patientName, patientType, lang, t) => {
  try {
    const isRTL = lang === 'ar';
    const direction = isRTL ? 'rtl' : 'ltr';
    const align = isRTL ? 'right' : 'left';
    
    let servicesRows = '';
    const services = invoiceData.services || [];
    services.forEach((s, idx) => {
      servicesRows += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid ${COLORS.divider};">${idx + 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${COLORS.divider}; font-weight: bold;">${s.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${COLORS.divider};">${s.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${COLORS.divider};">${s.price}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${COLORS.divider}; font-weight: bold; color: ${COLORS.primary};">${s.total}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}" dir="${direction}">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: ${COLORS.textMain}; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid ${COLORS.primary}; padding-bottom: 20px; }
          .logo { width: 120px; height: 120px; object-fit: contain; }
          .company-details { text-align: ${align}; }
          .company-name { color: ${COLORS.primary}; font-size: 28px; margin: 0 0 5px 0; font-weight: 700; }
          .company-sub { color: ${COLORS.textSub}; font-size: 14px; margin: 0; }
          .invoice-title { text-align: center; font-size: 24px; color: ${COLORS.secondary}; margin-bottom: 30px; font-weight: 700; background: ${COLORS.background}; padding: 10px; border-radius: 8px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { width: 48%; }
          .info-label { font-size: 12px; color: ${COLORS.textSub}; font-weight: 600; }
          .info-value { font-size: 16px; font-weight: 700; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: ${COLORS.primary}; color: white; padding: 12px; text-align: ${align}; font-weight: 600; }
          .totals { width: 300px; margin-${isRTL ? 'right' : 'left'}: auto; background: ${COLORS.background}; padding: 20px; border-radius: 12px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px; }
          .total-row.final { font-size: 22px; font-weight: 700; color: ${COLORS.primary}; border-top: 2px solid ${COLORS.divider}; padding-top: 10px; }
          .footer { margin-top: 60px; text-align: center; color: ${COLORS.textSub}; font-size: 14px; border-top: 1px solid ${COLORS.divider}; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
          .stamp { width: 150px; opacity: 0.8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-details">
            <h1 class="company-name">RETAL Dental Clinic</h1>
            <p class="company-sub">Dr. Ahmed Mohammed</p>
            <p class="company-sub">123 Medical Center, Downtown, City</p>
            <p class="company-sub">+123 456 7890 | info@retaldental.com</p>
          </div>
          <img src="${COMPANY_LOGO_BASE64}" class="logo" />
        </div>

        <div class="invoice-title">${t.invoiceTitleLabel} ${invoiceData.invoiceId ? '#'+invoiceData.invoiceId : ''}</div>

        <div class="info-section">
          <div class="info-box">
            <div class="info-label">${patientType === 'entity' ? t.entityNameLabel : t.patientNameLabel}</div>
            <div class="info-value">${patientName}</div>
          </div>
          <div class="info-box" style="text-align: ${isRTL ? 'left' : 'right'}">
            <div class="info-label">${t.serviceDateLabel}</div>
            <div class="info-value">${formatDate(invoiceData.date, lang)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${t.serviceNameLabel}</th>
              <th>${t.quantityLabel}</th>
              <th>${t.priceLabel}</th>
              <th>${t.totalLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${servicesRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>${t.totalLabel}:</span> <strong>${invoiceData.total} ${t.currency}</strong></div>
          <div class="total-row" style="color: ${COLORS.success}"><span>${t.paid}:</span> <strong>${invoiceData.paid} ${t.currency}</strong></div>
          <div class="total-row final" style="color: ${invoiceData.remaining > 0 ? COLORS.danger : COLORS.success}">
            <span>${t.remainingBalanceLabel}:</span> <span>${invoiceData.remaining} ${t.currency}</span>
          </div>
        </div>

        <div class="footer">
          <div>
            <p style="margin:0">${t.thankYouMessage}</p>
            <p style="margin:5px 0 0 0; font-size:12px">${t.visitAgainMessage}</p>
          </div>
          <img src="${STAMP_BASE64}" class="stamp" />
        </div>
      </body>
      </html>
    `;

    const { base64 } = await Print.printToFileAsync({ html: htmlContent, base64: true });
    const newPath = `${FileSystem.documentDirectory}invoice_${invoiceData.invoiceId || Date.now()}.pdf`;
    await FileSystem.writeAsStringAsync(newPath, base64, { encoding: FileSystem.EncodingType.Base64 });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath, { mimeType: 'application/pdf', dialogTitle: t.invoiceTitleLabel });
    } else {
      Alert.alert(t.alertError, t.sharingNotAvailable);
    }
  } catch (error) {
    console.error('PDF Generation Error:', error);
    Alert.alert(t.alertError, t.pdfGenerationFailed);
  }
};

const generateReportPDF = async (reportText, patientName, reportDate, lang, t) => {
  try {
    const isRTL = lang === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';
    const align = isRTL ? 'right' : 'left';
    const borderSide = isRTL ? 'border-right' : 'border-left';

    const translatedPatientName = await formatClientName(patientName, lang);
    const translatedReportText = await autoTranslateText(reportText, lang);
    const formattedReportText = translatedReportText.replace(/\n/g, '<br/>');

    const htmlContent = `
      <html dir="${dir}">
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
        body { font-family: 'Cairo', sans-serif; padding: 25px 40px; background-color: #ffffff; color: ${COLORS.textMain}; margin: 0; }
        .invoice-container { padding: 10px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${COLORS.primary}; padding-bottom: 15px; margin-bottom: 25px; }
        .patient-box { background: ${COLORS.surfaceVariant}; border-${borderSide}: 4px solid ${COLORS.primary}; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        .patient-box p { margin: 0; font-size: 18px; font-weight: 600; color: ${COLORS.textMain}; }
        .patient-box span { color: ${COLORS.primary}; font-weight: 700; margin: 0 5px; }
        .report-content { font-size: 16px; line-height: 1.8; color: ${COLORS.textMain}; margin-bottom: 40px; min-height: 300px; }
        .bottom-section { display: flex; justify-content: flex-start; align-items: center; margin-top: 40px; page-break-inside: avoid; background: ${COLORS.surfaceVariant}; border-radius: 12px; border: 1px solid ${COLORS.divider}; padding: 20px; }
        .stamp-container { text-align: center; width: 40%; }
        .signature-title { color: ${COLORS.textMain}; font-size: 18px; font-weight: 700; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="header-text" style="text-align: ${align};">
              <h1 style="color: ${COLORS.primary}; font-size: 28px; font-weight: 700; margin: 0;">${t.reportPdfTitle || 'Medical Report'}</h1>
              <h2 style="color: ${COLORS.textSub}; font-size: 16px; margin: 5px 0 0 0; font-weight: 600;">${t.pdfCompanySubtitle || t.clinicName || 'From RetalCare Medical Company'}</h2>
            </div>
            <img src="${COMPANY_LOGO_BASE64}" class="company-logo" style="max-height: 80px;" alt="Logo" />
          </div>
          <div class="patient-box">
            <p>${t.reportPatientNameLabel || 'Patient Name'}: <span>${translatedPatientName}</span></p>
            <p style="margin-top: 10px; font-size: 14px; color: ${COLORS.textSub};">${t.reportDateLabel || 'Date'}: ${formatDate(reportDate, lang)}</p>
          </div>
          
          <div class="report-content">
            ${formattedReportText}
          </div>

          <div class="bottom-section">
            <div class="stamp-container">
              <div class="signature-title">${t.pdfApprovedStamp || 'Approved'}</div>
              <img src="${STAMP_BASE64}" class="stamp-img" style="max-width: 140px; height: auto;" alt="Stamp" />
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const { base64 } = await Print.printToFileAsync({ html: htmlContent, base64: true });
    const newPath = `${FileSystem.documentDirectory}${t.reportPdfFileNamePrefix || 'Report'}_${Date.now()}.pdf`;
    await FileSystem.writeAsStringAsync(newPath, base64, { encoding: FileSystem.EncodingType.Base64 });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath, { mimeType: 'application/pdf', dialogTitle: t.reportPdfTitle });
    } else {
      Alert.alert(t.alertError, t.sharingNotAvailable);
    }
  } catch (error) {
    console.error('PDF Generation Error:', error);
    Alert.alert(t.alertError, t.pdfGenerationFailed || 'Failed');
  }
};

const FloatingHeader = ({ title, subtitle, showBack, navigation }) => {
  const { t, toggleLanguage, isRTL, flexDirection, textAlign } = useLanguage();
  return (
    <View style={[styles.modernHeader, { flexDirection: flexDirection }]}>
      <LinearGradient colors={['transparent', COLORS.primary]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.headerDividerGlow} />
      <View style={[styles.headerContentRight, { alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }]}>
        <Text style={[styles.headerTitleText, { textAlign: textAlign }]}>{title}</Text>
        {subtitle && <Text style={[styles.headerSubtitleText, { textAlign: textAlign }]}>{subtitle}</Text>}
      </View>
      
      <View style={{ flexDirection: flexDirection, alignItems: 'center' }}>
        <TouchableOpacity onPress={toggleLanguage} style={[styles.glassBtn, { marginRight: isRTL ? 12 : 0, marginLeft: isRTL ? 0 : 12 }]}>
          <MaterialCommunityIcons name="web" size={18} color={COLORS.primary} style={{ marginRight: isRTL ? 0 : 5, marginLeft: isRTL ? 5 : 0 }} />
          <Text style={styles.langBtnText}>{t.languageToggle}</Text>
        </TouchableOpacity>

        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name={isRTL ? "chevron-right" : "chevron-left"} size={26} color={COLORS.textMain} />
          </TouchableOpacity>
        ) : <View style={{width: 5}} />}
      </View>
    </View>
  );
}

function AddReportScreen({ route, navigation }) {
  const { t, lang, flexDirection, textAlign } = useLanguage();
  const { patient, reportToEdit } = route.params;
  const [reportDate, setReportDate] = useState(reportToEdit && reportToEdit.date ? new Date(reportToEdit.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reportText, setReportText] = useState(reportToEdit ? reportToEdit.content : '');

  const handleGeneratePDF = async () => {
    if (!reportText.trim()) {
      Alert.alert(t.alertError, t.reportTextAlert || 'Please write report content');
      return;
    }
    
    try {
      const isoDate = reportDate.toISOString();
      if (reportToEdit) {
        await axios.put(`${API_URL}/reports/${reportToEdit._id}`, {
          patientId: patient._id,
          date: isoDate,
          content: reportText
        });
      } else {
        await axios.post(`${API_URL}/reports`, {
          patientId: patient._id,
          date: isoDate,
          content: reportText
        });
      }
      await generateReportPDF(reportText, patient.name, isoDate, lang, t);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert(t.alertError, 'Failed to save report');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.mainContainer}>
      <FloatingHeader title={reportToEdit ? (t.editReportTitle || 'Edit Medical Report') : (t.reportScreenTitle || 'New Medical Report')} subtitle={patient.name} showBack={true} navigation={navigation} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Cairo_600SemiBold', color: COLORS.textMain, marginBottom: 8, textAlign: textAlign }}>
              {t.reportDateLabel || 'Report Date'}
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8} style={{ backgroundColor: COLORS.surfaceVariant, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.glassBorder }}>
              <Text style={{ fontFamily: 'Cairo_600SemiBold', color: COLORS.primary, textAlign: textAlign }}>
                {formatDate(reportDate.toISOString(), lang)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && <DateTimePicker value={reportDate} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setReportDate(d); }} />}
          </View>

          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontFamily: 'Cairo_600SemiBold', color: COLORS.textMain, marginBottom: 8, textAlign: textAlign }}>
              {t.reportTextLabel || 'Report Content'}
            </Text>
            <TextInput
              mode="outlined"
              value={reportText}
              onChangeText={setReportText}
              placeholder={t.reportTextPlaceholder || 'Write the report here...'}
              placeholderTextColor={COLORS.textLight}
              multiline={true}
              numberOfLines={8}
              style={{ backgroundColor: COLORS.surfaceElevated, textAlign: textAlign, minHeight: 180, justifyContent: 'flex-start' }}
              outlineColor={COLORS.glassBorder}
              activeOutlineColor={COLORS.primary}
              textColor={COLORS.textMain}
            />
          </View>

          <GradientButton onPress={handleGeneratePDF} style={styles.primaryButtonWrapper}>
            {t.generateReportBtn || 'Export PDF'}
          </GradientButton>
        </View>
        <View style={{ height: 100 }} /> 
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ReportsListScreen({ navigation }) {
  const { t, lang, isRTL, flexDirection, textAlign } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReports = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports?page=${pageNum}&limit=10`);
      if (pageNum === 1) {
        setReports(res.data);
      } else {
        setReports(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === 10);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { 
    setPage(1);
    fetchReports(1); 
  }, []));

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReports(nextPage);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(t.alertWarning || 'Warning', t.deleteConfirmMsg || 'Are you sure you want to delete this report?', [
      { text: t.cancelBtn, style: 'cancel' },
      { text: t.deleteBtn || 'Delete', style: 'destructive', onPress: async () => {
          try {
            await axios.delete(`${API_URL}/reports/${id}`);
            fetchReports();
          } catch (err) { console.log(err); }
      }}
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <FloatingHeader title={t.reportTab || 'Reports'} subtitle={t.reportTab || 'All Reports'} navigation={navigation} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        
        {loading ? <ActivityIndicator size="large" color={COLORS.primary}/> :
         reports.length === 0 ? <View style={styles.emptyState}><MaterialCommunityIcons name="newspaper-variant-outline" size={70} color={COLORS.textLight}/><Text style={styles.emptyStateText}>{t.noPreviousInvoices || 'No reports yet'}</Text></View> :
         reports.map(rep => (
          <TouchableOpacity 
            key={rep._id} 
            style={[styles.modernInvoiceCard, { paddingBottom: 15 }]} 
            activeOpacity={0.7} 
            onPress={() => {
              if(rep.patientId) {
                generateReportPDF(rep.content, rep.patientId.name, rep.date, lang, t);
              }
            }}>
            <View style={[styles.invoiceHeaderRow, { flexDirection: flexDirection, flexWrap: 'wrap' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.invoiceTotalText, { textAlign: textAlign, flexShrink: 1 }]} numberOfLines={1}>
                  {rep.patientId ? rep.patientId.name : t.pdfNoName}
                </Text>
              </View>
              <View style={styles.invoiceDateBox}><Text style={styles.invoiceDateText}>{formatDate(rep.date, lang)}</Text></View>
            </View>
            <View style={{ marginTop: 5, marginBottom: 15 }}>
              <Text style={[styles.invoiceDetailLabel, { textAlign: textAlign, flexWrap: 'wrap' }]} numberOfLines={3}>
                {rep.content}
              </Text>
            </View>
            
            <View style={{ flexDirection: flexDirection, justifyContent: 'flex-start', borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: 10 }}>
              <TouchableOpacity style={styles.materialIconButton} onPress={() => {
                if (rep.patientId) {
                  navigation.navigate('AddReport', { patient: rep.patientId, reportToEdit: rep });
                }
              }}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
                <Text style={[styles.materialIconButtonText, { color: COLORS.primary }]}>{t.editBtn || 'Edit'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.materialIconButton, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]} onPress={() => handleDelete(rep._id)}>
                <MaterialCommunityIcons name="delete" size={18} color={COLORS.danger} />
                <Text style={[styles.materialIconButtonText, { color: COLORS.danger }]}>{t.deleteBtn || 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        {(!loading && reports.length === 0) && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="newspaper-variant-outline" size={70} color={COLORS.textLight}/>
            <Text style={styles.emptyStateText}>{t.noPreviousInvoices || 'No reports yet'}</Text>
          </View>
        )}
        {hasMore && reports.length > 0 && !loading && (
          <GradientButton onPress={loadMore} style={[styles.primaryButtonWrapper, { marginTop: 10, alignSelf: 'center', width: 'auto', paddingHorizontal: 30 }]}>
            {t.loadMore || 'عرض المزيد'}
          </GradientButton>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.floatingNavbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const color = isFocused ? COLORS.primary : COLORS.textSub;
        const Icon = options.tabBarIcon;

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.customTabBarItem}
          >
            {Icon && Icon({ focused: isFocused, color, size: 30 })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const CustomInput = ({ label, value, onChange, icon, numeric, secure, style }) => {
  const { isRTL, textAlign } = useLanguage();
  return (
    <TextInput
      mode="outlined"
      placeholder={label}
      placeholderTextColor={COLORS.textSub}
      value={value}
      onChangeText={onChange}
      secureTextEntry={secure}
      keyboardType={numeric ? "numeric" : "default"}
      style={[styles.premiumInput, style, { textAlign: textAlign, direction: isRTL ? 'rtl' : 'ltr' }]}
      textAlign={textAlign}
      writingDirection={isRTL ? "rtl" : "ltr"}
      outlineColor={COLORS.glassBorder}
      activeOutlineColor={COLORS.primary}
      outlineStyle={{ borderRadius: 16, borderWidth: 1 }}
      contentStyle={{ fontFamily: 'Cairo_600SemiBold', textAlign: textAlign, direction: isRTL ? 'rtl' : 'ltr', color: COLORS.textMain }}
      right={isRTL ? <TextInput.Icon icon={() => <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />} style={{marginTop: 5}} /> : null}
      left={!isRTL ? <TextInput.Icon icon={() => <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />} style={{marginTop: 5}} /> : null}
      theme={{ colors: { background: COLORS.inputBg } }} 
      textColor={COLORS.textMain}
    />
  );
};

function LoginScreen({ navigation }) {
  const { t, toggleLanguage, isRTL, flexDirection, textAlign } = useLanguage();
  const { showAlert } = useAlert();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if(!username || !password) return showAlert(t.alertWarning, t.enterCredentials, [], 'warning');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      if (res.data.token && res.data.userId) {
        await AsyncStorage.setItem('userToken', res.data.token);
        await AsyncStorage.setItem('userId', res.data.userId);
      }
      navigation.replace('MainTabs');
    } catch (err) {
      showAlert(t.alertError, err.response?.data?.error || t.serverConnectionError, [], 'error');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.loginContainer}>
      <LinearGradient colors={['rgba(108, 99, 255, 0.1)', 'transparent']} style={styles.loginGradientBg} />
      <View style={styles.loginCard}>
        <View style={{ flexDirection: flexDirection, justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.glassBtn}>
            <MaterialCommunityIcons name="web" size={18} color={COLORS.primary} style={{ marginRight: isRTL ? 0 : 5, marginLeft: isRTL ? 5 : 0 }} />
            <Text style={styles.langBtnText}>{t.languageToggle}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginIconOuterGlow}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.loginIconWrapper} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <MaterialCommunityIcons name="shield-account" size={40} color="#FFF" />
          </LinearGradient>
        </View>
        <Text style={[styles.loginTitle, { textAlign: 'center' }]}>{t.loginTitle}</Text>
        <Text style={[styles.loginSubtitle, { textAlign: 'center' }]}>{t.loginSubtitle}</Text>
        
        <CustomInput label={t.usernameLabel} value={username} onChange={setUsername} icon="account" />
        <CustomInput label={t.passwordLabel} value={password} onChange={setPassword} icon="lock-outline" secure />
        
        <GradientButton onPress={handleLogin} disabled={loading} style={styles.primaryButtonWrapper}>
          {loading ? <ActivityIndicator color="#FFF" /> : t.loginBtn}
        </GradientButton>
      </View>
    </View>
  );
}

function AllInvoicesScreen({ navigation }) {
  const { t, lang, isRTL, flexDirection, textAlign } = useLanguage();
  const [search, setSearch] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAllInvoices = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/invoices?search=${search}&page=${pageNum}&limit=10`);
      if (pageNum === 1) {
        setInvoices(res.data);
      } else {
        setInvoices(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === 10);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { 
    setPage(1);
    fetchAllInvoices(1); 
  }, [search]));

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllInvoices(nextPage);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <FloatingHeader title={t.invoicesLog || "Invoices"} subtitle={t.patientInvoicesSubtitle || "All patient invoices"} navigation={navigation} />
      <View style={{paddingHorizontal: 20, marginBottom: 5}}>
        <CustomInput label={t.searchPlaceholder || 'Search...'} value={search} onChange={setSearch} icon="magnify" style={styles.googleSearchBar} />
      </View>
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        
        {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}}/> :
         invoices.length === 0 ? <View style={styles.emptyState}><MaterialCommunityIcons name="file-document" size={70} color={COLORS.textLight}/><Text style={styles.emptyStateText}>{t.noPreviousInvoices}</Text></View> :
         invoices.map(inv => {
           const patientName = inv.patientId?.name || 'مريض محذوف';
           const patientType = inv.patientId?.type || 'patient';
           return (
          <View key={inv._id} style={styles.modernInvoiceCard}>
            <View style={[styles.invoiceHeaderRow, { flexDirection: flexDirection }]}>
              <View>
                {inv.invoiceId && <Text style={[styles.listSubText, {textAlign: textAlign, marginBottom: 4}]}>{t.invoiceIdLabel} <Text style={{fontWeight: 'bold', color: COLORS.primary}}>#{inv.invoiceId}</Text></Text>}
                <Text style={styles.invoiceTotalText}>{inv.total} {t.currency}</Text>
              </View>
              <View style={styles.invoiceDateBox}><Text style={styles.invoiceDateText}>{formatDate(inv.date, lang)}</Text></View>
            </View>
            
            <View style={{marginBottom: 12}}>
               <TranslatedText text={patientName} lang={lang} isName={true} style={[styles.listName, { textAlign: textAlign }]} />
            </View>
            
            <View style={[styles.invoiceDetailsBox, { flexDirection: flexDirection }]}>
              <View style={styles.invoiceDetailItem}>
                <Text style={styles.invoiceDetailLabel}>{t.remaining}</Text>
                <Text style={[styles.invoiceDetailValue, {color: inv.remaining > 0 ? COLORS.danger : COLORS.success}]}>{inv.remaining}</Text>
              </View>
              <View style={styles.invoiceDetailItem}>
                <Text style={styles.invoiceDetailLabel}>{t.paid}</Text>
                <Text style={[styles.invoiceDetailValue, {color: COLORS.success}]}>{inv.paid}</Text>
              </View>
              <View style={styles.invoiceDetailItem}>
                <Text style={styles.invoiceDetailLabel}>{t.servicesCount}</Text>
                <Text style={styles.invoiceDetailValue}>{inv.services?.length || 0}</Text>
              </View>
            </View>

            <Divider style={{ marginVertical: 12, backgroundColor: COLORS.divider }} />

            <View style={[styles.invoiceActionsRow, { flexDirection: flexDirection }]}>
              {inv.patientId && (
                <TouchableOpacity style={[styles.materialIconButton, { flexDirection: flexDirection, marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10 }]} onPress={() => navigation.navigate('CreateInvoice', { patient: inv.patientId, invoiceToEdit: inv })}>
                  <MaterialCommunityIcons name="pencil" size={18} color={COLORS.textMain} />
                  <Text style={[styles.materialIconButtonText, {color: COLORS.textMain, marginRight: isRTL ? 5 : 0, marginLeft: isRTL ? 0 : 5}]}>{t.editBtn}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.materialIconButton, { flexDirection: flexDirection, backgroundColor: COLORS.primaryGlow }]} onPress={() => generateInvoicePDF(inv, patientName, patientType, lang, t)}>
                <MaterialCommunityIcons name="printer" size={18} color={COLORS.primary} />
                <Text style={[styles.materialIconButtonText, {color: COLORS.primary, marginRight: isRTL ? 5 : 0, marginLeft: isRTL ? 0 : 5}]}>{t.printBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
         )})}
        {(!loading && invoices.length === 0) && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document" size={70} color={COLORS.textLight}/>
            <Text style={styles.emptyStateText}>{t.noPreviousInvoices}</Text>
          </View>
        )}
        {hasMore && invoices.length > 0 && !loading && (
          <GradientButton onPress={loadMore} style={[styles.primaryButtonWrapper, { marginTop: 10, alignSelf: 'center', width: 'auto', paddingHorizontal: 30 }]}>
            {t.loadMore || 'عرض المزيد'}
          </GradientButton>
        )}
      </ScrollView>
    </View>
  );
}

function SearchPatientsScreen({ navigation }) {
  const { t, lang, isRTL, flexDirection, textAlign } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPatients = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/patients?search=${search}&page=${pageNum}&limit=10`);
      if (pageNum === 1) {
        setPatients(res.data);
      } else {
        setPatients(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === 10);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { 
    setPage(1);
    fetchPatients(1); 
  }, [search]));

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPatients(nextPage);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <FloatingHeader title={t.mainTitle} subtitle={t.patientFiles} navigation={navigation} />
      <View style={{paddingHorizontal: 20, marginBottom: 5}}>
        <CustomInput label={t.searchPlaceholder} value={search} onChange={setSearch} icon="magnify" style={styles.googleSearchBar} />
      </View>
      
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}}/> : 
         patients.map(p => (
          <TouchableOpacity key={p._id} style={styles.patientCard} onPress={() => navigation.navigate('PatientInvoices', {patient: p})} activeOpacity={0.7}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.patientCardAccent} start={{x: 0, y: 0}} end={{x: 0, y: 1}} />
            <View style={[styles.patientCardRight, { flexDirection: flexDirection }]}>
              <View style={[styles.avatarBox, { marginLeft: isRTL ? 15 : 0, marginRight: isRTL ? 0 : 15 }]}>
                <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={StyleSheet.absoluteFill} borderRadius={12} />
                <Text style={styles.avatarText}>{p.name.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={[styles.listInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.listName, { textAlign: textAlign }]}>{p.name}</Text>
                <Text style={[styles.listSubText, { textAlign: textAlign }]}>{p.type === 'entity' ? t.typeEntity : t.typePatient}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name={isRTL ? "chevron-left" : "chevron-right"} size={20} color={COLORS.textSub} />
          </TouchableOpacity>
        ))}
        {(!loading && patients.length === 0) && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group" size={70} color={COLORS.textLight}/>
            <Text style={styles.emptyStateText}>{t.noPatientsFound}</Text>
          </View>
        )}
        {hasMore && patients.length > 0 && !loading && (
          <GradientButton onPress={loadMore} style={[styles.primaryButtonWrapper, { marginTop: 10, alignSelf: 'center', width: 'auto', paddingHorizontal: 30 }]}>
            {t.loadMore || 'عرض المزيد'}
          </GradientButton>
        )}
      </ScrollView>
    </View>
  );
}

function AddPatientScreen({ navigation }) {
  const { t, lang, flexDirection, textAlign } = useLanguage();
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [type, setType] = useState('patient');
  const [loading, setLoading] = useState(false);

  const addPatient = async () => {
    if(!name) return showAlert(t.alertWarning, t.patientEnterAlert, [], 'warning');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/patients`, { name, type });
      showAlert(t.alertSuccess, t.patientRegisteredSuccess, [], 'success');
      setName('');
      setType('patient');
      navigation.navigate('Search'); 
    } catch (err) { showAlert(t.alertError, t.saveFailed, [], 'error'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.mainContainer}>
      <FloatingHeader title={t.newPatient} subtitle={t.addPatientData} navigation={navigation} />
      <View style={{padding: 20}}>
        <View style={styles.contentCard}>
          <View style={styles.iconCircleHeaderOuter}>
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.iconCircleHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <MaterialCommunityIcons name="account-plus" size={28} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={[styles.sectionTitleCenter, { textAlign: 'center' }]}>{t.enterFullName}</Text>
          <View style={{ flexDirection: flexDirection, justifyContent: 'space-between', marginBottom: 15 }}>
            <TouchableOpacity onPress={() => setType('patient')} style={[styles.typeBtn, type === 'patient' && styles.typeBtnActive, { width: '48%' }]}>
              <Text style={[styles.typeBtnText, type === 'patient' && styles.typeBtnTextActive]}>{t.typePatient}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType('entity')} style={[styles.typeBtn, type === 'entity' && styles.typeBtnActive, { width: '48%' }]}>
              <Text style={[styles.typeBtnText, type === 'entity' && styles.typeBtnTextActive]}>{t.typeEntity}</Text>
            </TouchableOpacity>
          </View>
          <CustomInput label={type === 'entity' ? t.entityNameLabel : t.patientNameLabel} value={name} onChange={setName} icon={type === 'entity' ? "domain" : "account-outline"} />
          <GradientButton onPress={addPatient} disabled={loading} style={[styles.primaryButtonWrapper, {marginTop: 20}] }>
            {loading ? <ActivityIndicator color="#FFF" /> : t.savePatientBtn}
          </GradientButton>
        </View>
      </View>
    </View>
  );
}

function PatientInvoicesScreen({ route, navigation }) {
  const { t, lang, isRTL, flexDirection, textAlign } = useLanguage();
  const { patient } = route.params;
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/invoices/${patient._id}`);
      setInvoices(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchInvoices(); }, []));

  return (
    <View style={styles.mainContainer}>
      <FloatingHeader title={patient.name} subtitle={t.patientInvoicesSubtitle} showBack={true} navigation={navigation} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        
        <View style={{ flexDirection: flexDirection, justifyContent: 'space-between', marginBottom: 25, flexWrap: 'wrap' }}>
          <TouchableOpacity style={[styles.primaryButtonWrapper, { flex: 1, marginBottom: 0, marginRight: isRTL ? 0 : 5, marginLeft: isRTL ? 5 : 0 }]} onPress={() => navigation.navigate('CreateInvoice', { patient })} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{x:0,y:0}} end={{x:1,y:0}} style={[styles.addInvoiceBtn, { flexDirection: flexDirection }]}>
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }} />
              <Text style={styles.addInvoiceBtnText}>{t.createNewInvoiceBtn}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {patient.type !== 'entity' && (
            <TouchableOpacity style={[styles.primaryButtonWrapper, { flex: 1, marginBottom: 0, marginLeft: isRTL ? 0 : 5, marginRight: isRTL ? 5 : 0 }]} onPress={() => navigation.navigate('AddReport', { patient })} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.secondary, '#00A68A']} start={{x:0,y:0}} end={{x:1,y:0}} style={[styles.addInvoiceBtn, { flexDirection: flexDirection }]}>
                <MaterialCommunityIcons name="file-document" size={24} color="#FFF" style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }} />
                <Text style={styles.addInvoiceBtnText}>{t.reportScreenTitle || 'Add Report'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.sectionTitle, { textAlign: textAlign }]}>{t.invoicesLog}</Text>
        
        {loading ? <ActivityIndicator size="large" color={COLORS.primary}/> :
         invoices.length === 0 ? <View style={styles.emptyState}><MaterialCommunityIcons name="file-document" size={70} color={COLORS.textLight}/><Text style={styles.emptyStateText}>{t.noPreviousInvoices}</Text></View> :
         invoices.map(inv => (
          <View key={inv._id} style={styles.modernInvoiceCard}>
            <View style={[styles.invoiceHeaderRow, { flexDirection: flexDirection }]}>
              <View>
                {inv.invoiceId && <Text style={[styles.listSubText, {textAlign: textAlign, marginBottom: 4}]}>{t.invoiceIdLabel} <Text style={{fontWeight: 'bold', color: COLORS.primary}}>#{inv.invoiceId}</Text></Text>}
                <Text style={styles.invoiceTotalText}>{inv.total} {t.currency}</Text>
              </View>
              <View style={styles.invoiceDateBox}><Text style={styles.invoiceDateText}>{formatDate(inv.date, lang)}</Text></View>
            </View>
            
            <View style={[styles.invoiceDetailsBox, { flexDirection: flexDirection }]}>
              <View style={styles.invoiceDetailItem}>
                <Text style={styles.invoiceDetailLabel}>{t.remaining}</Text>
                <Text style={[styles.invoiceDetailValue, {color: inv.remaining > 0 ? COLORS.danger : COLORS.success}]}>{inv.remaining}</Text>
              </View>
              <View style={styles.invoiceDetailItem}>
                <Text style={styles.invoiceDetailLabel}>{t.paid}</Text>
                <Text style={[styles.invoiceDetailValue, {color: COLORS.success}]}>{inv.paid}</Text>
              </View>
              <View style={styles.invoiceDetailItem}>
                <Text style={styles.invoiceDetailLabel}>{t.servicesCount}</Text>
                <Text style={styles.invoiceDetailValue}>{inv.services?.length || 0}</Text>
              </View>
            </View>

            <Divider style={{ marginVertical: 12, backgroundColor: COLORS.divider }} />

            <View style={[styles.invoiceActionsRow, { flexDirection: flexDirection }]}>
              <TouchableOpacity style={[styles.materialIconButton, { flexDirection: flexDirection, marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10 }]} onPress={() => navigation.navigate('CreateInvoice', { patient, invoiceToEdit: inv })}>
                <MaterialCommunityIcons name="pencil" size={18} color={COLORS.textMain} />
                <Text style={[styles.materialIconButtonText, {color: COLORS.textMain, marginRight: isRTL ? 5 : 0, marginLeft: isRTL ? 0 : 5}]}>{t.editBtn}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.materialIconButton, { flexDirection: flexDirection, backgroundColor: COLORS.primaryGlow }]} onPress={() => generateInvoicePDF(inv, patient.name, patient.type, lang, t)}>
                <MaterialCommunityIcons name="printer" size={18} color={COLORS.primary} />
                <Text style={[styles.materialIconButtonText, {color: COLORS.primary, marginRight: isRTL ? 5 : 0, marginLeft: isRTL ? 0 : 5}]}>{t.printBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function CreateInvoiceScreen({ route, navigation }) {
  const { t, lang, isRTL, flexDirection, textAlign } = useLanguage();
  const { showAlert } = useAlert();
  const { patient, invoiceToEdit } = route.params;
  const [serviceName, setServiceName] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState('1');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [services, setServices] = useState(invoiceToEdit ? [...invoiceToEdit.services] : []);
  const [amountPaid, setAmountPaid] = useState(invoiceToEdit ? invoiceToEdit.paid.toString() : '');
  const [loading, setLoading] = useState(false);

  const addService = () => {
    if (!serviceName || parseInt(serviceQuantity) <= 0 || parseFloat(servicePrice) <= 0) return showAlert(t.alertWarning, t.invalidServiceAlert, [], 'warning');
    const newService = {
      id: Date.now().toString(), name: serviceName, quantity: parseInt(serviceQuantity),
      price: parseFloat(servicePrice), date: serviceDate.toISOString(), total: parseInt(serviceQuantity) * parseFloat(servicePrice)
    };
    setServices([...services, newService].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setServiceName(''); setServiceQuantity('1'); setServicePrice('');
  };

  const currentTotal = services.reduce((sum, item) => sum + item.total, 0);
  const currentPaid = parseFloat(amountPaid) || 0;
  const currentRemaining = currentTotal - currentPaid;

  const saveInvoice = async () => {
    if (services.length === 0) return Alert.alert(t.alertWarning, t.addServicesFirstAlert);
    setLoading(true);
    try {
      const payload = {
        patientId: patient._id, date: invoiceToEdit ? invoiceToEdit.date : new Date().toISOString(),
        services, total: currentTotal, paid: currentPaid, remaining: currentRemaining
      };
      if (invoiceToEdit) await axios.delete(`${API_URL}/invoices/${invoiceToEdit._id}`);
      await axios.post(`${API_URL}/invoices`, payload);
      await generateInvoicePDF(payload, patient.name, patient.type, lang, t);
      navigation.goBack();
    } catch (err) { Alert.alert(t.alertError, t.saveServerFailed); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.mainContainer}>
      <FloatingHeader title={invoiceToEdit ? t.editInvoiceTitle : t.newInvoiceTitle} subtitle={patient.name} showBack={true} navigation={navigation} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.contentCard}>
          <Text style={[styles.sectionTitle, { textAlign: textAlign }]}>{t.addMedicalServiceSection}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.9}>
            <View pointerEvents="none"><CustomInput label={t.serviceDateLabel} value={formatDate(serviceDate, lang)} icon="calendar" /></View>
          </TouchableOpacity>
          {showDatePicker && <DateTimePicker value={serviceDate} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setServiceDate(d); }} />}
          
          <CustomInput label={t.serviceNameLabel} value={serviceName} onChange={setServiceName} icon="medical-bag" />
          
          <View style={{ flexDirection: flexDirection, justifyContent: 'space-between' }}>
            <CustomInput label={t.priceLabel} value={servicePrice} onChange={setServicePrice} numeric style={{width: '48%'}} icon="cash" />
            <CustomInput label={t.quantityLabel} value={serviceQuantity} onChange={setServiceQuantity} numeric style={{width: '48%'}} icon="calculator" />
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={addService}>
            <Text style={styles.secondaryButtonText}>{t.addServiceToInvoiceBtn}</Text>
          </TouchableOpacity>
        </View>

        {services.length > 0 && (
          <View style={[styles.contentCard, {marginTop: 20}]}>
            <Text style={[styles.sectionTitle, { textAlign: textAlign }]}>{t.servicesListSection}</Text>
            {services.map((item, index) => (
              <View key={item.id} style={[styles.modernServiceRow, { flexDirection: flexDirection }]}>
                <View style={[styles.serviceRowRight, { flexDirection: flexDirection }]}>
                  <View style={[styles.indexCircle, { marginLeft: isRTL ? 12 : 0, marginRight: isRTL ? 0 : 12 }]}>
                    <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={StyleSheet.absoluteFill} borderRadius={18} />
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <View style={[styles.listInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.listName, { textAlign: textAlign }]}>{item.name}</Text>
                    <Text style={[styles.listSubText, { textAlign: textAlign }]}>{item.quantity} × {item.price} {t.currency}</Text>
                  </View>
                </View>
                <View style={{flexDirection: flexDirection, alignItems: 'center'}}>
                  <Text style={styles.serviceTotalText}>{item.total} {t.currency}</Text>
                  <TouchableOpacity onPress={() => setServices(services.filter(s => s.id !== item.id))} style={{ marginRight: isRTL ? 10 : 0, marginLeft: isRTL ? 0 : 10 }}>
                     <MaterialCommunityIcons name="close-circle-outline" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <Divider style={{ marginVertical: 20, backgroundColor: COLORS.divider }} />
            <CustomInput label={t.amountPaidLabel} value={amountPaid} onChange={setAmountPaid} numeric icon="cash" />
            
            <LinearGradient colors={[COLORS.primaryDark, '#2E2B68']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.summaryBox}>
              <View style={[styles.summaryRow, { flexDirection: flexDirection }]}><Text style={styles.summaryLabel}>{t.totalLabel}</Text><Text style={styles.summaryValue}>{currentTotal} {t.currency}</Text></View>
              <View style={[styles.summaryRow, { flexDirection: flexDirection, marginTop: 8 }]}><Text style={styles.summaryLabel}>{t.remainingBalanceLabel}</Text><Text style={[styles.summaryValueBig, { color: currentRemaining > 0 ? COLORS.warning : COLORS.success }]}>{currentRemaining} {t.currency}</Text></View>
            </LinearGradient>
            
            <GradientButton onPress={saveInvoice} disabled={loading} style={styles.primaryButtonWrapper}>
              {loading ? <ActivityIndicator color="#FFF" /> : (invoiceToEdit ? t.updateAndPdfBtn : t.saveAndPdfBtn)}
            </GradientButton>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MainTabs({ navigation }) {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="Search" 
        component={SearchPatientsScreen} 
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              {focused && <View style={styles.tabIconGlow} />}
              <MaterialCommunityIcons name={focused ? "account-group" : "account-group-outline"} size={30} color={color} style={{ textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false }} />
            </View>
          )
        }}
      />
      
      <Tab.Screen 
        name="Add" 
        component={AddPatientScreen} 
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              {focused && <View style={styles.tabIconGlow} />}
              <MaterialCommunityIcons name={focused ? "account-plus" : "account-plus-outline"} size={30} color={color} style={{ textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false }} />
            </View>
          )
        }}
      />

      <Tab.Screen 
        name="AllInvoices" 
        component={AllInvoicesScreen} 
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              {focused && <View style={styles.tabIconGlow} />}
              <MaterialCommunityIcons name={focused ? "file-document" : "file-document-outline"} size={30} color={color} style={{ textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false }} />
            </View>
          )
        }}
      />

      <Tab.Screen 
        name="MedicalReports" 
        component={ReportsListScreen} 
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              {focused && <View style={styles.tabIconGlow} />}
              <MaterialCommunityIcons name={focused ? "newspaper-variant" : "newspaper-variant-outline"} size={30} color={color} style={{ textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false }} />
            </View>
          )
        }}
      />

      <Tab.Screen 
        name="Logout" 
        component={SearchPatientsScreen} 
        listeners={{
          tabPress: async (e) => {
            e.preventDefault();
            showAlert(t.logoutConfirmTitle, t.logoutConfirmMsg, [
              {text: t.cancelBtn, style: 'cancel'},
              {text: t.confirmLogoutBtn, style: 'destructive', onPress: async () => {
                try {
                  const userId = await AsyncStorage.getItem('userId');
                  if (userId) {
                    await axios.post(`${API_URL}/auth/logout`, { userId });
                  }
                } catch(err) {}
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
                navigation.replace('Login');
              }}
            ], 'warning');
          }
        }}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              {focused && <View style={styles.tabIconGlow} />}
              <MaterialCommunityIcons name={focused ? "logout" : "logout-variant"} size={30} color={color} style={{ textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false }} />
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
}


const AlertContext = React.createContext({
  showAlert: () => {},
  hideAlert: () => {}
});

export const useAlert = () => React.useContext(AlertContext);

function CustomAlertModal({ config, onClose }) {
  const { visible, title, message, type = 'info', buttons = [] } = config;
  const { isRTL, flexDirection } = useLanguage();

  if (!visible) return null;

  let gradientColors = [COLORS.primaryDark, COLORS.primary];
  let iconName = 'information';

  if (type === 'success') {
    gradientColors = [COLORS.success, '#059669'];
    iconName = 'check-circle';
  } else if (type === 'warning') {
    gradientColors = [COLORS.warning, '#D97706'];
    iconName = 'alert';
  } else if (type === 'error' || type === 'danger') {
    gradientColors = [COLORS.danger, '#DC2626'];
    iconName = 'alert-circle';
  }

  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return (
        <TouchableOpacity style={styles.alertPrimaryBtnWrapper} onPress={onClose} activeOpacity={0.85}>
          <LinearGradient colors={gradientColors} style={styles.alertBtnGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
            <Text style={styles.alertPrimaryBtnText}>موافق</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <View style={{ flexDirection: flexDirection, gap: 10, marginTop: 15, justifyContent: 'center', width: '100%' }}>
        {buttons.map((btn, idx) => {
          const isDestructive = btn.style === 'destructive';
          const isCancel = btn.style === 'cancel';

          const handlePress = () => {
            onClose();
            if (btn.onPress) btn.onPress();
          };

          if (isCancel) {
            return (
              <TouchableOpacity key={idx} style={[styles.alertSecondaryBtn, { flex: buttons.length > 1 ? 1 : 0 }]} onPress={handlePress} activeOpacity={0.8}>
                <Text style={styles.alertSecondaryBtnText}>{btn.text}</Text>
              </TouchableOpacity>
            );
          }

          const btnGradient = isDestructive ? [COLORS.danger, '#DC2626'] : gradientColors;

          return (
            <TouchableOpacity key={idx} style={[styles.alertPrimaryBtnWrapper, { flex: buttons.length > 1 ? 1 : 0 }]} onPress={handlePress} activeOpacity={0.85}>
              <LinearGradient colors={btnGradient} style={styles.alertBtnGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                <Text style={styles.alertPrimaryBtnText}>{btn.text}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.alertBackdrop}>
        <View style={styles.alertCard}>
          <LinearGradient colors={gradientColors} style={styles.alertHeaderBadge} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <MaterialCommunityIcons name={iconName} size={42} color="#FFFFFF" />
          </LinearGradient>
          
          <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 22, alignItems: 'center', width: '100%' }}>
            <Text style={[styles.alertTitle, { textAlign: 'center' }]}>{title}</Text>
            {message ? <Text style={[styles.alertMessage, { textAlign: 'center' }]}>{message}</Text> : null}
            {renderButtons()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AlertProvider({ children }) {
  const [config, setConfig] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  const showAlert = (title, message, buttons = [], type = 'info') => {
    let alertType = type;
    let alertButtons = buttons;

    if (typeof buttons === 'string') {
      alertType = buttons;
      alertButtons = [{ text: 'موافق' }];
    } else if (!buttons || buttons.length === 0) {
      alertButtons = [{ text: 'موافق' }];
    }

    if (alertType === 'info' && title) {
      const lower = String(title).toLowerCase();
      if (lower.includes('خطأ') || lower.includes('error') || lower.includes('فشل') || lower.includes('تعذر')) {
        alertType = 'error';
      } else if (lower.includes('تنبيه') || lower.includes('تحذير') || lower.includes('warning') || lower.includes('تأكيد')) {
        alertType = 'warning';
      } else if (lower.includes('نجاح') || lower.includes('تم') || lower.includes('success')) {
        alertType = 'success';
      }
    }

    setConfig({
      visible: true,
      title: title || '',
      message: message || '',
      type: alertType,
      buttons: alertButtons
    });
  };

  const hideAlert = () => {
    setConfig(prev => ({ ...prev, visible: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlertModal config={config} onClose={hideAlert} />
    </AlertContext.Provider>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({ Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold });
  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <AlertProvider>
      <PaperProvider theme={MD3DarkTheme}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: {backgroundColor: COLORS.background} }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="PatientInvoices" component={PatientInvoicesScreen} />
            <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
            <Stack.Screen name="AddReport" component={AddReportScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AlertProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({

  alertBackdrop: { flex: 1, backgroundColor: 'rgba(10, 14, 26, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertCard: { width: '100%', maxWidth: 340, backgroundColor: COLORS.surface, borderRadius: 20, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  alertHeaderBadge: { width: '100%', paddingVertical: 22, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontFamily: 'Cairo_700Bold', fontSize: 19, color: COLORS.textMain, marginBottom: 8 },
  alertMessage: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: COLORS.textSub, lineHeight: 22, marginBottom: 10 },
  alertPrimaryBtnWrapper: { borderRadius: 24, overflow: 'hidden', minWidth: 100 },
  alertBtnGradient: { paddingHorizontal: 22, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  alertPrimaryBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: '#FFFFFF' },
  alertSecondaryBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, backgroundColor: COLORS.surfaceVariant, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', justifyContent: 'center', minWidth: 90 },
  alertSecondaryBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: COLORS.textMain },

  fontBold: { fontFamily: 'Cairo_700Bold' },
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  
  glassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  langBtnText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
    color: COLORS.primary,
  },

  modernHeader: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60, paddingBottom: 15, paddingHorizontal: 25, backgroundColor: 'rgba(10, 14, 26, 0.85)', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerContentRight: { alignItems: 'flex-end', flex: 1 }, 
  headerTitleText: { fontFamily: 'Cairo_700Bold', fontSize: 26, color: COLORS.textMain },
  headerSubtitleText: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: COLORS.textSub },
  headerDividerGlow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, opacity: 0.8 },
  backButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.glass, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 }, 
  
  contentCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 25, borderWidth: 1, borderColor: COLORS.glassBorder },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: COLORS.textMain, marginBottom: 20, textAlign: 'right' },
  sectionTitleCenter: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: COLORS.textMain, marginBottom: 25, textAlign: 'center' },
  iconCircleHeaderOuter: { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.primaryGlow, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 15 },
  iconCircleHeader: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  
  premiumInput: { backgroundColor: COLORS.inputBg, marginBottom: 16, height: 60, justifyContent: 'center', direction: 'rtl', borderRadius: 16 },
  googleSearchBar: { backgroundColor: COLORS.inputBg, borderRadius: 16, height: 56, borderWidth: 1, borderColor: COLORS.glassBorder },
  
  typeBtn: { paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', backgroundColor: COLORS.surfaceElevated },
  typeBtnActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary, borderWidth: 1.5 },
  typeBtnText: { fontFamily: 'Cairo_600SemiBold', color: COLORS.textSub, fontSize: 14 },
  typeBtnTextActive: { color: COLORS.primary, fontFamily: 'Cairo_700Bold' },
  
  primaryButtonWrapper: { marginTop: 10, borderRadius: 24, shadowColor: COLORS.primary, shadowOffset: {width:0, height:0}, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  primaryButton: { borderRadius: 24, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#FFF' },
  secondaryButton: { backgroundColor: COLORS.glass, borderRadius: 24, paddingVertical: 15, alignItems: 'center', marginTop: 5, borderWidth: 1, borderColor: COLORS.primary },
  secondaryButtonText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: COLORS.primary },
  
  addInvoiceBtn: { borderRadius: 24, paddingVertical: 15, justifyContent: 'center', alignItems: 'center' },
  addInvoiceBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#FFF', marginLeft: 8 },

  patientCard: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: 'hidden' },
  patientCardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  patientCardRight: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1 },
  avatarBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 15 },
  avatarText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#FFF' },
  listInfo: { alignItems: 'flex-end', justifyContent: 'center', flex: 1 },
  listName: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: COLORS.textMain, textAlign: 'right' },
  listSubText: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: COLORS.textSub, textAlign: 'right', marginTop: 2 },
  
  modernInvoiceCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: COLORS.glassBorder },
  invoiceHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  invoiceDateBox: { backgroundColor: COLORS.surfaceElevated, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.glassBorder },
  invoiceDateText: { fontFamily: 'Cairo_600SemiBold', fontSize: 12, color: COLORS.textSub },
  invoiceTotalText: { fontFamily: 'Cairo_700Bold', fontSize: 22, color: COLORS.textMain },
  invoiceDetailsBox: { flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: COLORS.surfaceElevated, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.glassBorder },
  invoiceDetailItem: { alignItems: 'center' },
  invoiceDetailLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 12, color: COLORS.textSub, marginBottom: 4 },
  invoiceDetailValue: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: COLORS.textMain },
  invoiceActionsRow: { flexDirection: 'row-reverse', justifyContent: 'flex-start', marginTop: 8 },
  materialIconButton: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: COLORS.surfaceElevated, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginLeft: 10, borderWidth: 1, borderColor: COLORS.glassBorder },
  materialIconButtonText: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, marginRight: 6 },

  modernServiceRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  serviceRowRight: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1 },
  indexCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  indexText: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: '#FFF' },
  serviceTotalText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: COLORS.textMain },
  
  summaryBox: { borderRadius: 20, padding: 20, marginTop: 10, shadowColor: COLORS.primary, shadowOffset:{width:0, height:0}, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.9)' },
  summaryValue: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#FFF' },
  summaryValueBig: { fontFamily: 'Cairo_700Bold', fontSize: 24, color: '#FFF' },

  floatingNavbar: { position: 'absolute', bottom: 25, left: 20, right: 20, backgroundColor: 'rgba(20, 25, 41, 0.95)', borderRadius: 35, height: 70, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  customTabBarItem: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' },
  tabIconWrapper: { justifyContent: 'center', alignItems: 'center', width: 50, height: 50, borderRadius: 25 },
  tabIconWrapperActive: { backgroundColor: COLORS.primaryGlow },
  tabIconGlow: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, opacity: 0.1 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyStateText: { fontFamily: 'Cairo_600SemiBold', color: COLORS.textSub, marginTop: 16, fontSize: 16 },
  
  loginContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 20 },
  loginGradientBg: { ...StyleSheet.absoluteFillObject },
  loginCard: { backgroundColor: COLORS.surface, padding: 32, borderRadius: 24, shadowColor: COLORS.primary, shadowOffset: {width:0, height:0}, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: COLORS.glassBorder },
  loginIconOuterGlow: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primaryGlow, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 24 },
  loginIconWrapper: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
  loginTitle: { fontFamily: 'Cairo_700Bold', fontSize: 28, color: COLORS.textMain, textAlign: 'center' },
  loginSubtitle: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: COLORS.textSub, textAlign: 'center', marginBottom: 32 },
});
