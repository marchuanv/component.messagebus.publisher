const utils = require("utils");
const fs = require("fs");
const delegate = require("component.delegate");
const messageBusHost = require("component.messagebus.host");
const requestHandlerSecure = require("component.request.handler.secure");
const requestSecure = require("component.request.secure");
const logging = require("logging");
logging.config.add("MessageBus Publisher");

module.exports = { 
    handle: async (callingModule, { publicHost, publicPort, privateHost, privatePort }) => {
        const registerModule = `component.messagebus.publisher.register`;
        delegate.register(registerModule, async ({ hosts }) => { //register host with publisher
            let message = ""
            logging.write("MessageBus Publisher",message);
            for(const host of hosts){
                const path = `${host.channel}/publish`;
                const publishModule = `component.messagebus.publisher.${host.channel}`;
                delegate.register(publishModule, async ({ headers: {  username, publishid, data } }) => {
                    message = `publishing message to the ${host.channel} channel and notifying all hosts.`;
                    logging.write("MessageBus Publisher",message);
                    await requestSecure.send({
                        host: host.publicHost,
                        port: host.publicPort,
                        path: `/${host.channel}/publish`,
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            username,
                            hashedPassphrase: host.hashedPassphrase,
                            hashedPassphraseSalt: host.hashedPassphraseSalt,
                            fromhost: publicHost,
                            fromport: publicPort,
                            publishid
                        }, 
                        data
                    });
                    await delegate.call(callingModule, { channel: host.channel });
                });
                message = `host is registered with publisher, messages can be published to ${host.publicHost}:${host.publicPort}/${path}`;
                await requestHandlerSecure.handle(publishModule, { 
                    publicHost: host.publicHost,
                    publicPort: host.publicPort,
                    privateHost: host.privateHost,
                    privatePort: host.privatePort,
                    path
                });
            };
            return { headers: { "Content-Type":"text/plain", "Content-Length": Buffer.byteLength(message) }, statusCode: 200, statusMessage: "Success", data: message };
        });
        await messageBusHost.handle(registerModule, { publicHost, publicPort, privateHost, privatePort });
    }
};