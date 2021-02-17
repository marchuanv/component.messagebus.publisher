const messageBusPublisher = require("./component.messagebus.publisher.js");
const delegate = require("component.delegate");
const request = require("component.request");
(async() => { 

    await messageBusPublisher.handle({
        host: "localhost", 
        port: 3000
    });

    //Register New Host
    const newHost = { host: "localhost", port: "6000" };
    let results = await request.send({ 
        host: "localhost",
        port: 3000,
        path: "/host",
        method: "GET",
        headers: { 
            username: "marchuanv",
            fromhost: "bob",
            fromport: 999
        }, 
        data: JSON.stringify(newHost),
        retryCount: 1
    });
    if (results.statusCode !== 200){
        throw "New Request To Register New Host Test Failed";
    }

     //New Request To Secured Host To Register A Channel
     results = await request.send({
         host: newHost.host,
         port: newHost.port,
         path: "/channel/register",
         method: "GET",
         headers: { 
             username: "marchuanv",
             fromhost: "bob",
             fromport: 999
         }, 
         data: `{ "channel":"apples" }`,
         retryCount: 1
     });
     if (results.statusCode !== 200){
         throw "New Request To Unsecured Host To Register A Channel Test Failed";
     }

    //New Subscribe Request To Unsecured Host Channel
    results = await request.send({
        host: newHost.host,
        port: newHost.port,
        path: "/apples/subscribe",
        method: "POST",
        headers: { 
            username: "marchuanv",
            fromhost: "bob",
            fromport: 999
        }, 
        data: ``,
        retryCount: 1
    });
    if (results.statusCode !== 200 && results.statusMessage !== "Subscribe Successful"){
        throw "New Subscribe Request To Unsecured Host Channel Test Failed";
    }

    //New Publish Request To Unsecured Host Channel
    results = await request.send({
        host: newHost.host,
        port: newHost.port,
        path: "/apples/publish",
        method: "POST",
        headers: { 
            username: "marchuanv",
            fromhost: "bob",
            fromport: 999
        }, 
        data: ``,
        retryCount: 1
    });
    if (results.statusCode !== 200 && results.statusMessage !== "Publish Successful"){
        throw "New Publish Request To Unsecured Host Channel Test Failed";
    }

})().catch((err)=>{
    console.error(err);
});