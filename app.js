const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
	apiKey: config.apiKey,
	server: config.server,
});

async function run() {
	const response = await mailchimp.ping.get();
	console.log(response);
}

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

app.get(signup.route, (req, res) => {
    res.sendFile(signup.page);
    run();
})

app.post(signup.route, (req, res) => {
	
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;

    console.log(firstName, lastName, email);

    const response = addContact(firstName, lastName, email);

    if (response.id !== null) 
        res.sendFile(success.page);
    else
        res.sendFile(failure.page);
});


async function addContact(firstName, lastName, email) {
    const listId = config.listId;
    const subscribingUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
    };

    const response =  await mailchimp.lists.addListMember(listId, {
        email_address: subscribingUser.email,
        status: "subscribed",
        merge_fields: {
            FNAME: subscribingUser.firstName,
            LNAME: subscribingUser.lastName,
        },
    });

    console.log(
        `Successfully added contact as an audience member. The contact's id is ${response.id}.`
    );

    return response;
}












app.listen(port, () => {
    console.log(`listening on on port ${port}`);
})