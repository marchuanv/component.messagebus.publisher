(async() => { 
    const newHost = { host: "localhost", port: "6000" };
    const request = require("./test.request.js");
    const messageBusPublisher = require("./component.messagebus.publisher.js");
    await messageBusPublisher.handle({ host: "localhost", port: 3000 });
    //Register New Host
    let results = await request({ host:"localhost", port: 3000 }, "/host", JSON.stringify(newHost));
    if (results.statusCode !== 200 || results.statusMessage !== "localhost started on port 6000"){
        throw new Error("Publish To Channel On Host Test Failed");
    }
    //Register Channel On Host
    results = await request(newHost, "/channel/register", JSON.stringify({ channel: "apples" }));
    if (results.statusCode !== 200 || results.statusMessage !== "apples registered"){
        throw new Error("Register Channel On Host Test Failed");
    }
    //Subscribe To Channel On Host
    results = await request(newHost, "/apples/subscribe", "");
    if (results.statusCode !== 200 || results.statusMessage !== "Subscribe Successful"){
        throw new Error("Subscribe To Channel On Host Test Failed");
    }
    //Publish To Channel On Host
    results = await request(newHost, "/apples/publish", "");
    while (results.statusCode === 202){
        results = await request(newHost, "/apples/publish", "", results.headers.deferredrequestid);
    }
    if (results.statusCode !== 200 || results.statusMessage !== "Publish Successful"){
        throw new Error("Publish To Channel On Host Test Failed");
    }
    process.exit();
})().catch((err)=>{
    console.error(err);
});