function sendEmailsToContractors() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var contractorsSheet = ss.getSheetByName('Contractors');
  var emailsSheet = ss.getSheetByName('Emails');

  var contractorsData = contractorsSheet.getDataRange().getValues();
  var emailsData = emailsSheet.getDataRange().getValues();

  var imageId = '101UkVQkxxJGhIfn6B1ySDSZWDAkDiZMi'; // image ID, got it from a shareable link
  var imageBlob = DriveApp.getFileById(imageId).getBlob();

  var sentCount = 0;
  var failedEmails = []; // { email, subject, reason }

  // Loop through the emails data
  for (var i = 1; i < emailsData.length; i++) {
    var emailInfo = emailsData[i];
    var areas = (emailInfo[0] || '').toString().split(/,\s*/); // Split by comma and optional space
    var subject = emailInfo[1];
    var baseMessage = (emailInfo[2] || '').toString().replace(/\n/g, '<br>'); // Replace newline characters with <br>
    var includeSignature = emailInfo[3]; // Column D
    var confirmSend = emailInfo[4]; // Column E

    // Check if confirm send is checked and subject and message are provided
    if (!confirmSend || !subject || !baseMessage) continue;

    // Loop over each area and send emails
    areas.forEach(function(area) {
      area = area.trim().toLowerCase(); // Trim whitespace and convert to lowercase
      if (!area) return;

      // Find contractors in the specified area and send emails
      for (var j = 1; j < contractorsData.length; j++) {
        var contractor = contractorsData[j];
        var contractorArea = (contractor[0] || '').toString().toLowerCase(); // Convert to lowercase for comparison
        var contractorName = contractor[2];
        var contractorEmail = (contractor[3] || '').toString();

        // Check if the contractor is in the specified area
        if (contractorArea !== area) continue;

        if (!contractorEmail.trim()) {
          failedEmails.push({
            email: '(blank)',
            subject: subject,
            reason: 'No email address for contractor "' + contractorName + '" (row ' + (j + 1) + ')'
          });
          continue;
        }

        // Handle multiple email addresses
        var emails = contractorEmail.split(/[,; ]+/);

        // Replace the placeholder with the contractor's name
        var personalizedMessage = baseMessage.replace(/{contractorName}/g, contractorName);

        // Append signature and logo if requested
        if (includeSignature) {
          personalizedMessage += `
            <br><br><div>
              <img src="cid:signatureImage" alt="Signature Image" style="width: 400px;">
              <p><i>Warm regards,</i><br><i>Blue Belle Weddings Team</i></p>
              <p><b><a href="https://www.bluebelleweddings.com/">www.bluebelleweddings.com</a></b></p>
            </div>`;
        }

        // Send the email to all provided email addresses
        for (var k = 0; k < emails.length; k++) {
          var recipient = emails[k].trim();
          if (!recipient) continue;

          try {
            MailApp.sendEmail({
              to: recipient,
              subject: subject,
              htmlBody: personalizedMessage,
              inlineImages: includeSignature ? { signatureImage: imageBlob } : {}
            });
            sentCount++;
          } catch (err) {
            failedEmails.push({
              email: recipient,
              subject: subject,
              reason: err && err.message ? err.message : String(err)
            });
          }
        }
      }
    });
  }

  // Display a message box after sending emails
  showSendReport_(sentCount, failedEmails, 'Emails');
}


function sendPreviewEmail() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var emailsSheet = ss.getSheetByName('Emails');
  var senderEmail = Session.getActiveUser().getEmail(); // Get sender's email

  var emailsData = emailsSheet.getDataRange().getValues();
  var imageId = '101UkVQkxxJGhIfn6B1ySDSZWDAkDiZMi';
  var imageBlob = DriveApp.getFileById(imageId).getBlob();

  var previewCount = 0;
  var failedEmails = [];

  for (var i = 1; i < emailsData.length; i++) {
    var emailInfo = emailsData[i];
    var subject = emailInfo[1];
    var baseMessage = (emailInfo[2] || '').toString().replace(/\n/g, '<br>');
    var includeSignature = emailInfo[3];
    var confirmSend = emailInfo[4];

    if (!confirmSend || !subject || !baseMessage) continue;

    var personalizedMessage = baseMessage;

    if (includeSignature) {
      personalizedMessage += `
        <br><br><div>
          <img src="cid:signatureImage" alt="Signature Image" style="width: 400px;">
          <p><i>Warm regards,</i><br><i>Blue Belle Weddings Team</i></p>
          <p><b><a href="https://www.bluebelleweddings.com/">www.bluebelleweddings.com</a></b></p>
        </div>`;
    }

    try {
      MailApp.sendEmail({
        to: senderEmail,
        subject: 'Preview: ' + subject,
        htmlBody: personalizedMessage,
        inlineImages: includeSignature ? { signatureImage: imageBlob } : {}
      });
      previewCount++;
    } catch (err) {
      failedEmails.push({
        email: senderEmail,
        subject: 'Preview: ' + subject,
        reason: err && err.message ? err.message : String(err)
      });
    }
  }

  showSendReport_(previewCount, failedEmails, 'Preview');
}


function showSendReport_(sentCount, failedEmails, label) {
  label = label || 'Emails';
  var ui = SpreadsheetApp.getUi();

  var msg = label + ' sent successfully: ' + sentCount + '\n';
  msg += 'Failed: ' + failedEmails.length;

  if (failedEmails.length > 0) {
    msg += '\n\nFailed list:\n';
    msg += failedEmails.map(function(f, idx) {
      return (idx + 1) + '. ' + f.email + '  \u2014  "' + f.subject + '"\n     Reason: ' + f.reason;
    }).join('\n');
  }

  ui.alert(label + ' send report', msg, ui.ButtonSet.OK);
}
