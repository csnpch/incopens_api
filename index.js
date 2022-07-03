const FormData = require('form-data');
const moment = require('moment-timezone');
const tokenLineNoti = 'kQUMVr19npaeuXUAEpsLNtYJAN9GWHVor9L0eiQ1PHI';
const urlApplication = `https://incopens4489.netlify.app/`;

const express = require('express');
const app = express();
const router = express.Router();
const cors = require('cors');
const axios = require('axios');
const PORT = 4000 || process.env.PORT;
var fetchTime = moment().tz("Asia/Bangkok").format('DD/MM/YYYY, h:mm:ss');
var tmpNow = {
    date: null,
    month: null,
    year: null,
    hour: null,
    minute: null,
    second: null
}

let tmpDate = null;
let tmpTime = null;
let statusSendNoti = {
    today: true,
    month: true
};

//- moment - timeCountDown
const sendNotification = (now) => {

    if (!statusSendNoti.today && now.hour == 0) {
        statusSendNoti.today = true;
    }

    if (!statusSendNoti.month && (now.date == 1 && now.hour == 0)) {
        statusSendNoti.month = true;
    }

    if (
        statusSendNoti.today
        && ((now.hour >= 20 && now.hour < 22) 
        && (now.minute >= 40 && now.minute < 60))
    ) {
        statusSendNoti.today = false;

        let formData = new FormData();
        formData.append('message', 
            '🤑'
            + '\n\nฮัลโหล ๆ อย่าลืมเข้าไปบันทึก' 
            + '\nรายรับ-รายจ่าย สำหรับวันนี้กันด้วยน้า' 
            + '\nกดเข้าไปบันทึกได้ที่ลิ้งนี้เลย' 
            + `\n${urlApplication}` 
            + '\n\nด้วยความหวังดีจาก 4489-NotiBOT'
        );

        axios.post('https://notify-api.line.me/api/notify/', formData, {
            headers: { 'Authorization': `Bearer ${tokenLineNoti}` }
        })
    }

    if (
        statusSendNoti.month
        && (now.date === 1 && (now.hour >= 22 && now.hour <= 23) 
        && (now.minute >= 0 && now.minute <= 20))
    ) {
        statusSendNoti.month = false;

        let formData = new FormData();
        formData.append('message', 
            '🗓'
            + '\n\nฮัลโหล ๆ วันนี้ขึ้นเดือนใหม่แล้ว'
            + '\nน้องแฮมอย่าลืมส่งออกข้อมูลไปเก็บไว้บน Google Sheet ให้ด้วยนะ'
            + `\n\n${urlApplication}` 
            + '\n\nด้วยความหวังดีจาก 4489-NotiBOT'
        );

        axios.post('https://notify-api.line.me/api/notify/', formData, {
            headers: { 'Authorization': `Bearer ${tokenLineNoti}` }
        })
    } 

}


setInterval(() => {
    fetchTime = moment().tz("Asia/Bangkok").format('DD/MM/YYYY, HH:mm:ss');
    tmpDate = fetchTime.split(',')[0];
    tmpTime = fetchTime.split(',')[1];
    tmpNow.date = parseInt(tmpDate.split('/')[0]);
    tmpNow.month = parseInt(tmpDate.split('/')[1]);
    tmpNow.year = parseInt(tmpDate.split('/')[2]);
    tmpNow.hour = parseInt(tmpTime.split(':')[0]);
    tmpNow.minute = parseInt(tmpTime.split(':')[1]);
    tmpNow.second = parseInt(tmpTime.split(':')[2]);

    sendNotification(tmpNow);
}, 240000);


//- express & routes
app.use(cors({ origin: '*' }));
app.use(express.json());

router.get('/', (req, res) => {
    res.send('Welcome to backend Incopens!');
});

router.post('/line/notify', (req, res) => {

    if (!req.body.message) {
        res.json({msg: 'message is required'});
    }

    // find word in req.body.message is 'คุณแฮม'
    let formData = new FormData();
    if (req.body.message.includes('คุณแฮม')) {
        formData.append('message',
            `😍\n${req.body.message}`
        );
    } else {
        formData.append('message',
            '😍'
            + req.body.message
            + '\n\nใครยังไม่บันทึก อย่ารอช้า กดเข้าไปได้ที่นี่เลย'
            + `\n${urlApplication}`
            + '\n\nด้วยความหวังดีจาก 4489-NotiBOT'
        );
    }

    

    axios.post('https://notify-api.line.me/api/notify/', formData, {
        headers: { 'Authorization': `Bearer ${tokenLineNoti}` }
    }).finally(() => {
        res.status(200).json({msg: 'success'});
    });
    
});

app.use('/', router);

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
