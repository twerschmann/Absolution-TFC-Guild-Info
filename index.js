const express = require('express');
const Datastore = require('nedb');
const fetch = require("node-fetch");
require('dotenv').config();

const apiKey = process.env.API_KEY;
const port = process.env.PORT || 8080;

const app = express();
app.listen(port, () => console.log(`Hört auf ${port}`));
app.use(express.static('public'));
app.use(express.json({limit:'2mb'}));


const database = new Datastore({filename: 'database.db'});
database.loadDatabase();

app.post('/addChar', async (req, res) =>{
    const data = req.body;
    const server = data.ServerName;
    const charname = data.CharName;

    if(server && charname) {
        const fetch_response = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${charname}?namespace=profile-eu&locale=en_GB&access_token=${apiKey}`);
        const json = await fetch_response.json();
        if (json.code) {
            console.log('char not found');
        } else {
            database.count({CharName: charname, ServerName: server}, (err, count) => {
                if (count < 1) {
                    database.insert(data);
                }
            });
        }
        res.end();
    }
});

app.get('/getData', async (request, response) => {
    const charData = [] ;
    let charCount = 0;

    database.count({},(err, count) => {
        charCount = count;
    })

    database.find({},async (err, data) => {
        if(err){
            response.end();
            return;
        }
        for(let i = 0; i< charCount;i++){
            let item = data[i];
            const server = item.ServerName;
            const charname = item.CharName;
            const fetch_response = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${charname}?namespace=profile-eu&locale=en_GB&access_token=${apiKey}`);
            const json = await fetch_response.json();
            const player = {
                CharName: json.name,
                ServerName: json.realm.name,
                Itemlvl: json.average_item_level,
                Class: json.character_class.name,
                Spec: json.active_spec.name
            }
            charData.push(player);
        }
        charData.sort(((a, b) => {
            return a.Itemlvl - b.Itemlvl
        }))
        console.log(charData);
        response.json(charData);
    })
});