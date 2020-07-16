const messageBusHost = require("./component.messagebus.publisher.js");
const delegate = require("component.delegate");
(async() => { 
    const callingModule = "someapplicationinterestedinpublishevents";
    delegate.register(callingModule, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await messageBusHost.handle(callingModule, {
        publicHost: "localhost", 
        publicPort: 3000, 
        privateHost: "localhost", 
        privatePort: 3000
    });
})().catch((err)=>{
    console.error(err);
});