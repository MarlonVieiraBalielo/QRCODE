$(document).ready(function () {
    var SPMaskBehavior = function (val) {
        return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
    },
        spOptions = {
            onKeyPress: function (val, e, field, options) {
                field.mask(SPMaskBehavior.apply({}, arguments), options);
            }
        };
    $('.celular-mask').mask(SPMaskBehavior, spOptions);
});

function showField(type) {
    const fields = ['text', 'whatsapp', 'wifi', 'email', 'sms', 'pix', 'vcard', 'location'];
    fields.forEach(field => {
        document.getElementById(`${field}Field`).style.display = field === type ? 'block' : 'none';
        document.getElementById(`btn${field.charAt(0).toUpperCase() + field.slice(1)}`).classList.remove('active');
    });
    document.getElementById(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`).classList.add('active');
}

function generateQRCode() {
    const activeField = document.querySelector('.field[style*="block"]');
    const qrcodeDiv = document.getElementById("qrcode");
    const qrImg = document.getElementById('img-qr');
    qrcodeDiv.innerHTML = "";

    let qrData = "";

    if (activeField.id === "textField") {
        qrData = document.getElementById("textInput").value;

    } else if (activeField.id === "whatsappField") {
        const countryCode = document.getElementById('countryCode').value.replace('+', '');
        const phoneNumber = document.getElementById("phoneNumber").value.replace(/\D/g, '');
        const message = document.getElementById("message").value;
        qrData = `https://wa.me/${countryCode}${phoneNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

    } else if (activeField.id === "wifiField") {
        const ssid = document.getElementById("ssidInput").value;
        const password = document.getElementById("passwordInput").value;
        const encryption = document.getElementById("encryptionInput").value;
        qrData = `WIFI:T:${encryption};S:${ssid};P:${password};;`;

    } else if (activeField.id === "emailField") {
        const email = document.getElementById("emailInput").value;
        const subject = document.getElementById("emailSubject").value;
        const body = document.getElementById("emailBody").value;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        qrData = `mailto:${email}${params.length ? '?' + params.join('&') : ''}`;

    } else if (activeField.id === "smsField") {
        const countryCode = document.getElementById('smsCountryCode').value.replace('+', '');
        const phone = document.getElementById("smsPhone").value.replace(/\D/g, '');
        const message = document.getElementById("smsMessage").value;
        qrData = `SMSTO:+${countryCode}${phone}${message ? `:${message}` : ''}`;

    } else if (activeField.id === "pixField") {
        const chave = document.getElementById("pixKey").value.trim();
        const nome = document.getElementById("pixName").value.trim();
        const cidade = document.getElementById("pixCity").value.trim();
        const valor = document.getElementById("pixValue").value.trim();
        if (chave && nome && cidade) {
            qrData = buildPixPayload(chave, nome, cidade, valor);
        }

    } else if (activeField.id === "vcardField") {
        const name = document.getElementById("vcardName").value;
        const phone = document.getElementById("vcardPhone").value.replace(/\D/g, '');
        const email = document.getElementById("vcardEmail").value;
        const org = document.getElementById("vcardOrg").value;
        const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${name}`];
        if (phone) lines.push(`TEL;TYPE=CELL:+55${phone}`);
        if (email) lines.push(`EMAIL:${email}`);
        if (org) lines.push(`ORG:${org}`);
        lines.push('END:VCARD');
        qrData = lines.join('\n');

    } else if (activeField.id === "locationField") {
        const lat = document.getElementById("locationLat").value;
        const lng = document.getElementById("locationLng").value;
        if (lat && lng) qrData = `geo:${lat},${lng}`;
    }

    if (qrData) {
        new QRCode(qrcodeDiv, {
            text: qrData,
            width: 300,
            height: 300,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        qrImg.style.display = 'none';
        qrcodeDiv.classList.add('box');

        setTimeout(() => {
            const canvas = qrcodeDiv.querySelector("canvas");
            const downloadLink = document.getElementById("downloadLink");
            if (canvas) {
                downloadLink.href = canvas.toDataURL("image/png");
                downloadLink.style.display = "inline-block";
            }
        }, 500);
    }
}

function buildPixPayload(chave, nome, cidade, valor) {
    function f(id, v) {
        return id + v.length.toString().padStart(2, '0') + v;
    }
    const merchantInfo = f('26', f('00', 'BR.GOV.BCB.PIX') + f('01', chave));
    const additionalData = f('62', f('05', '***'));
    let payload = f('00', '01') +
        merchantInfo +
        f('52', '0000') +
        f('53', '986') +
        (valor && parseFloat(valor) > 0 ? f('54', parseFloat(valor).toFixed(2)) : '') +
        f('58', 'BR') +
        f('59', nome.substring(0, 25)) +
        f('60', cidade.substring(0, 15)) +
        additionalData +
        '6304';
    return payload + crc16Ccitt(payload);
}

function crc16Ccitt(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}
