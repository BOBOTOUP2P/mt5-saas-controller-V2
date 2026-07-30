const express = require('express');
const mongoose = require('mongoose');
const MetaApi = require('metaapi.cloud-sdk').default;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let dbConnected = false;
let apiConnected = false;

// ១. តភ្ជាប់ទៅកាន់ MongoDB Database
const MONGO_URI = "mongodb+srv://nna617014_db_user:HcihqVABHE4BLqSL@cluster0.iwa7tts.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Connected to MongoDB");
    dbConnected = true;
})
.catch(err => {
    dbConnected = false;
});

// ២. តភ្ជាប់ជាមួយ MetaApi Cloud SDK (កូដ Token ដើមពិតប្រាកដរបស់អ្នក ១០០% ឥតមានខូចទ្រង់ទ្រាយ)
const token = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4NTU2ZWZkMDM2YmVjZWMwOTUwNWQ3ZmE5ZWNhMzNlZiIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiODU1NmVmZDAzNmJlY2VjMDk1MDVkN2ZhOWVjYTMzZWYiLCJpYXQiOjE3ODUzNDA4ODl9.JHjSxBZOB9eDGuoHrmOB46_YTHJbbrnFNsIzm7nnrq_f3KazJ3fzTQ0WSeuuQbc5mE3y9gd95LlQHJpV6ac6Fpy4UxltBArSkZmf0OfPbzZo7N8LTN0wtD8ZsnmVrgdeYehFEf0mrjNJXxANXMgUd__TKUm-x_qWeG3k6LvVPzZR9TObxwIZVlGscVM9bIbrEZrFSpFeUw02ymkIX8Yxr6qWw5VthRu-QA2p1e3L9d_T8hcVKoubLtGgFo2lXLt2rGkxhtrbWivA32OvDZ5-nWM_4bOuT5ftG5nL6LtQzkSR5oDTWX8l-gRr2lea6INjLVNdyizCF6_MDbYL9o4pgJSB6lN9DftkHVldxryD_aXJzNGla73KbRqzNGbkpKA97jgTLSGEwo8KasI00x5Ez6WbDgpC3qBjUtKxJMLos_RPPlrP-1kQbyjdlkXz1UEZU_gwNMiZp5whJX668__L_JtlMyVq7kttLtMBpRd-lbziT6q91SO6Gu4oFGi1IfMlHFgr7PmWkDNXY23YK1z4SeNdXh4nXrvTxUCKi8J6w0chD1rd83dDG_mgp2BM-k2J-WuouK-5zYPafikRJLRtFUX28GxhVlakyWyHaczg8Em0vTBesz3mWnOWRcL7mmMoK7eC58IQ4LsW0E1K7gchW0G-XuX9fU75y5cabBWSsj4";
const api = new MetaApi(token);

api.metatraderAccountApi.getAccounts()
.then(() => { apiConnected = true; })
.catch(() => { apiConnected = false; });

const UserSchema = new mongoose.Schema({
    accId: { type: String, unique: true },
    password_mt5: String,
    server: String,
    platform: String,
    lotSize: Number,
    sl_usd: Number,
    tp_usd: Number,
    active: Boolean
});
const User = mongoose.model('User', UserSchema);

// ៣. API សម្រាប់សមាជិកចុះឈ្មោះ និងផ្ទៀងផ្ទាត់ (ប្រព័ន្ធ Auto-Clean កូតា Free)
app.post('/api/register', async (req, res) => {
    const { accId, password_mt5, server, platform, lotSize, sl_usd, tp_usd } = req.body;
    
    try {
        // លុបគណនីចាស់ៗទាំងអស់មុនដំឡើងថ្មី ដើម្បីកុំឱ្យស្ទះកូតា Free Tier
        const existingAccounts = await api.metatraderAccountApi.getAccounts();
        for (const acc of existingAccounts) {
            await acc.remove();
            console.log("លុបគណនីចាស់ចោលជោគជ័យ៖ " + acc.id);
        }
        
        // បង្កើតការតភ្ជាប់គណនីថ្មី
        const account = await api.metatraderAccountApi.createAccount({
            name: "Client_" + accId,
            type: 'cloud',
            login: accId,
            password: password_mt5,
            server: server,
            platform: platform,
            magic: 555555
        });
        
        const connection = account.getRPCConnection();
        await connection.connect();
        await connection.waitSynchronized();
        
        const accountInfo = await connection.getAccountInformation();

        // រក្សាទុកក្នុង Database
        await User.findOneAndUpdate(
            { accId: accId },
            { accId, password_mt5, server, platform, lotSize, sl_usd, tp_usd, active: true },
            { upsert: true, new: true }
        );

        res.json({ 
            success: true, 
            message: "ជោគជ័យ៖ គណនី Exness របស់អ្នកត្រូវបានតភ្ជាប់ទៅកាន់ Cloud ជោគជ័យ!",
            balance: accountInfo.balance,
            equity: accountInfo.equity
        });
        
    } catch (err) {
        res.json({ success: false, message: "ការតភ្ជាប់ទៅ Exness បរាជ័យ៖ " + err.message });
    }
});

// ៤. API សម្រាប់ទាញយកស្ថានភាពស្ពានតភ្ជាប់ទូទៅ
app.get('/api/status-general', (req, res) => {
    res.json({
        db: dbConnected,
        api: apiConnected
    });
});

// ៥. API សម្រាប់ស្កែនរកស្ថានភាពគណនី
app.get('/api/status-account/:accId', async (req, res) => {
    let accountConnected = false;
    let balance = "0.00", equity = "0.00";
    
    const user = await User.findOne({ accId: req.params.accId });
    
    if (user) {
        try {
            const account = await api.metatraderAccountApi.createAccount({
                name: "Client_" + user.accId,
                type: 'cloud',
                login: user.accId,
                password: user.password_mt5,
                server: user.server,
                platform: user.platform
            });
            const connection = account.getRPCConnection();
            await connection.connect();
            await connection.waitSynchronized();
            
            const accountInfo = await connection.getAccountInformation();
            balance = accountInfo.balance;
            equity = accountInfo.equity;
            accountConnected = true;
        } catch (err) {
            accountConnected = false;
        }
    }

    res.json({
        account: accountConnected,
        balance: balance,
        equity: equity
    });
});

app.listen(PORT, () => console.log(`Server is running`));
