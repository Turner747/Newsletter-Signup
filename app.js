const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const mailchimp = require("@mailchimp/mailchimp_marketing");
const https = require('node:https');
const { post } = require('request');

mailchimp.setConfig({
	apiKey: "6da557be190dda6694d71a2b6236ab5c-us18",
	server: "us18",
});

const signup = {
	route: "/",
	title: "signup",
	page: __dirname + "/signup.html",
};

const success = {
	route: "/success",
	title: "success",
	page: __dirname + "/success.html",
};

const failure = {
	route: "/failure",
	title: "failure",
	page: __dirname + "/failure.html",
};

app.get(success.route, (req, res) => {
	res.redirect('/');
});

app.get(failure.route, (req, res) => {
	res.redirect("/");
});

app.get(signup.route, (req, res) => {
	res.sendFile(signup.page);
});

app.post(signup.route, (req, res) => {
	
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const listId = "65e55df031";

    console.log(firstName, lastName, email);

    var data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const run = async () => {
        const response = await mailchimp.lists.batchListMembers(listId, data);

        if(response.total_created === 1)
            res.sendFile(success.page);
        else
            res.sendFile(failure.page);
    };

    try{
        run();
    }
    catch(err) {
        res.sendFile(failure.page);
        console.log(err);
    }
	
});




app.listen(port, () => {
    console.log(`listening on on port ${port}`);
})