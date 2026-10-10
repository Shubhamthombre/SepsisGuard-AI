const nodemailer = require('nodemailer');

const sendRiskAlertEmail = async (clinician, patient, assessment) => {
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT || 587;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM || 'SepsisGuard AI <noreply@sepsisguard.ai>';
  const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!emailHost || !emailUser || !emailPass) {
    console.log(`[Email Notice] Email alert skipped for patient ${patient.name} (${assessment.status}): Email credentials (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) are not configured in environment variables.`);
    return false;
  }

  if (!clinician || !clinician.email) {
    console.log(`[Email Notice] Email alert skipped: Clinician email not found for patient ${patient.name}.`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: Number(emailPort),
      secure: Number(emailPort) === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const riskColor = assessment.status === 'High Risk' ? '#dc2626' : '#d97706';
    const assessmentTime = new Date(assessment.recordedAt).toLocaleString();
    const patientLink = `${appUrl}/patient/${patient._id}`;

    const mailOptions = {
      from: emailFrom,
      to: clinician.email,
      subject: `[${assessment.status.toUpperCase()}] SepsisGuard AI Alert - Patient: ${patient.name} (${patient.patientId})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #0b132b; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: ${riskColor}; margin-top: 0;">Clinical Early Warning Alert</h2>
          <p>Hello <strong>Dr. ${clinician.name}</strong>,</p>
          <p>A new clinical assessment for your monitored patient has been classified as <strong style="color: ${riskColor};">${assessment.status}</strong>.</p>
          
          <div style="background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${riskColor};">
            <p style="margin: 4px 0;"><strong>Patient Name:</strong> ${patient.name}</p>
            <p style="margin: 4px 0;"><strong>Patient ID:</strong> ${patient.patientId}</p>
            <p style="margin: 4px 0;"><strong>Risk Category:</strong> <span style="color: ${riskColor}; font-weight: bold;">${assessment.status}</span> (Score: ${assessment.sepsisRiskScore}%)</p>
            <p style="margin: 4px 0;"><strong>Assessment Time:</strong> ${assessmentTime}</p>
          </div>

          <p>Please log in to review the latest telemetry and feature contributions immediately.</p>
          
          <a href="${patientLink}" style="display: inline-block; padding: 12px 24px; background: #06b6d4; color: #0b132b; font-weight: bold; text-decoration: none; border-radius: 8px; margin-top: 12px;">View Patient Profile</a>

          <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
            SepsisGuard AI Educational Research Prototype &bull; Automated Clinical Notification
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`🟢 Email alert successfully sent to clinician ${clinician.email} for patient ${patient.name} (${assessment.status}).`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send email alert:', err.message);
    return false;
  }
};

module.exports = { sendRiskAlertEmail };
