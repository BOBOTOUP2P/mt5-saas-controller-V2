const express = require('express');
const mongoose = require('mongoose');
const MetaApi = require('metaapi.cloud-sdk').default;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// ១. តភ្ជាប់ទៅកាន់ MongoDB Database សម្រាប់រក្សាទុកសមាជិក
const MONGO_URI = "វាយបញ្ចូលកូដតភ្ជាប់_MONGODB_Connection_String_របស់អ្នកនៅទីនេះ";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to MongoDB"))
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

// ៣. តភ្ជាប់ជាមួយ MetaApi Cloud SDK
const token = 'វាយបញ្ចូល_METAAPI_TOKEN_របស់អ្នកនៅទីនេះ';
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
        // តភ្ជាប់ទៅ Exness តាមរយៈ Cloud API
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

app.listen(PORT, () => console.log(`SaaS Server running`));
