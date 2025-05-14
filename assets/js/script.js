// Máscara para o campo de número de telefone
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

// Alternar entre campos
function showField(type) {
    const fields = ['text', 'whatsapp', 'wifi'];
    fields.forEach(field => {
        document.getElementById(`${field}Field`).style.display = field === type ? 'block' : 'none';
        document.getElementById(`btn${field.charAt(0).toUpperCase() + field.slice(1)}`).classList.remove('active');
    });
    document.getElementById(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`).classList.add('active');
}

// Função para gerar QR Code
function generateQRCode() {
    const activeField = document.querySelector('.field[style*="block"]');
    const qrcodeDiv = document.getElementById("qrcode");
    const qrImg = document.getElementById('img-qr');
    qrcodeDiv.innerHTML = ""; // Limpa o QR Code anterior

    let qrData = "";

    if (activeField.id === "textField") {
        qrData = document.getElementById("textInput").value;
    } else if (activeField.id === "whatsappField") {
        const countryCode = document.getElementById('countryCode').value;
        const phoneNumber = document.getElementById("phoneNumber").value.replace(/\D/g, ''); // Remove caracteres não numéricos

        // ✅ Agora o campo é <textarea>, e "\n" será tratado por encodeURIComponent corretamente
        const message = document.getElementById("message").value;

        qrData = `https://wa.me/${countryCode}${phoneNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    } else if (activeField.id === "wifiField") {
        const ssid = document.getElementById("ssidInput").value;
        const password = document.getElementById("passwordInput").value;
        const encryption = document.getElementById("encryptionInput").value;
        qrData = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
    }

    if (qrData) {
        const qrCode = new QRCode(qrcodeDiv, {
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
        }, 500); // Aguardar renderização
    }
}
