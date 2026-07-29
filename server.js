const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const MetaApi = require('metaapi.cloud-sdk').default;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ១. តភ្ជាប់ទៅកាន់ MongoDB Database របស់អ្នក (បំពេញរួចរាល់)
const MONGO_URI = "mongodb+srv://nna617014_db_user:HcihqVABHE4BLqSL@cluster0.iwa7tts.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("Database connection failed", err));

// ២. បង្កើតរចនាសម្ព័ន្ធរក្សាទុកគណនីសមាជិក (User Schema)
const UserSchema = new mongoose.Schema({
    username: String,
    accId: String,
    password_mt5: String,
    server: String,
    lotSize: Number,
    sl_usd: Number,
    tp_usd: Number,
    active: Boolean
});
const User = mongoose.model('User', UserSchema);

// ៣. តភ្ជាប់ជាមួយ MetaApi Cloud SDK (បំពេញរួចរាល់)
const token = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4NTU2ZWZkMDM2YmVjZWMwOTUwNWQ3ZmE5ZWNhMzNlZiIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiODU1NmVmZDAzNmJlY2VjMDk1MDVkN2ZhOWVjYTMzZWYiLCJpYXQiOjE3ODUzNDA4ODl9.JHjSxBZOB9eDGuoHrmOB46_YTHJbbrnFNsIzm7nnrq_f3KazJ3fzTQ0WSeuuQbc5mE3y9gd95LlQHJpV6ac6Fpy4UxltBArSkZmf0OfPbzZo7N8LTN0wtD8ZsnmVrgdeYehFEf0mrjNJXxANXMgUd__TKUm-x_qWeG3k6LvVPzZR9TObxwIZVlGscVM9bIbrEZrFSpFeUw02ymkIX8Yxr6qWw5VthRu-QA2p1e3L9d_T8hcVKoubLtGgFo2lXLt2rGkxhtrbWivA32OvDZ5-nWM_4bOuT5ftG5nL6LtQzkSR5oDTWX8l-gRr2lea6INjLVNdyizCF6_MDbYL9o4pgJSB6lN9DftkHVldxryD_aXJzNGla73KbRqzNGbkpKA97jgTLSGEwo8KasI00x5Ez6WbDgpC3qBjUtKxJMLos_RPPlrP-1kQbyjdlkXz1UEZU_gwNMiZp5whJX668__L_JtlMyVq7kttLtMBpRd-lbziT6q91SO6Gu4oFGi1IfMlHFgr7PmWkDNXY23YK1z4SeNdXh4nXrvTxUCKi8J6w0chD1rd83dDG_mgp2BM-k2J-WuouK-5zYPafikRJLRtFUX28GxhVlakyWyHaczg8Em0vTBesz3mWnOWRcL7mmMoK7eC58IQ4LsW0E1K7gchW0G-XuX9fU75y5cabBWSsj4";
const api = new MetaApi(token);

// ៤. API សម្រាប់សមាជិកចុះឈ្មោះ និងកំណត់ Limit លើវិបសាយ
app.post('/api/register', async (req, res) => {
    const { username, accId, password_mt5, server, lotSize, sl_usd, tp_usd } = req.body;
    try {
        const newUser = new User({
            username, accId, password_mt5, server, lotSize, sl_usd, tp_usd, active: true
        });
        await newUser.save();
        res.send("ជោគជ័យ៖ គណនីរបស់អ្នកត្រូវបានចុះឈ្មោះ និងតភ្ជាប់រួចរាល់!");
    } catch (err) {
        res.status(500).send("កំហុសបច្ចេកទេស៖ " + err.message);
    }
});

// ៥. API សម្រាប់ទាញយកសមតុល្យ Balance ពី Exness មកបង្ហាញលើវិបសាយ
app.get('/api/status/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).send("រកមិនឃើញសមាជិក");

    try {
        const account = await api.metatraderAccountApi.createAccount({
            name: user.username,
            type: 'cloud',
            login: user.accId,
            password: user.password_mt5,
            server: user.server,
            platform: 'mt5'
        });
        const connection = account.getRPCConnection();
        await connection.connect();
        await connection.waitSynchronized();
        
        const accountInfo = await connection.getAccountInformation();
        res.json({
            balance: accountInfo.balance,
            equity: accountInfo.equity,
            positions: "ដំណើរការធម្មតា"
        });
    } catch (err) {
        res.json({ balance: "0.00", equity: "0.00", positions: "ដាច់ការតភ្ជាប់" });
    }
});

app.listen(PORT, () => console.log(`SaaS Server running on port ${PORT}`));
