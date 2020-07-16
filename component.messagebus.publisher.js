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
        delegate.register(registerModule, async ({ newHost, hosts }) => { //register host with publisher
            let message = ""
            const path = `/${newHost.channel}/publish`;
            const publishModule = `component.messagebus.publisher.${newHost.channel}`;
            delegate.register(publishModule, async ({ headers: { username, publishid, fromhost, fromport }, data }) => {
                message = `publishing message to the ${newHost.channel} channel and notifying all hosts.`;
                logging.write("MessageBus Publisher",message);
                for(const remoteHost of hosts.filter(h => h.channel === newHost.channel)){
                    await requestSecure.send({
                        host: remoteHost.publicHost,
                        port: remoteHost.publicPort,
                        path: `/${remoteHost.channel}/publish`,
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            username,
                            hashedPassphrase: remoteHost.hashedPassphrase,
                            hashedPassphraseSalt: remoteHost.hashedPassphraseSalt,
                            fromhost,
                            fromport,
                            publishid
                        }, 
                        data
                    });
                };
                await delegate.call(callingModule, { channel: newHost.channel });
            });
            message = `host is registered with publisher, messages can be published to ${newHost.publicHost}:${newHost.publicPort}/${path}`;
            logging.write("MessageBus Publisher",message);
            await requestHandlerSecure.handle(publishModule, { 
                publicHost: newHost.publicHost,
                publicPort: newHost.publicPort,
                privateHost: newHost.privateHost,
                privatePort: newHost.privatePort,
                path
            });
            return { headers: { "Content-Type":"text/plain", "Content-Length": Buffer.byteLength(message) }, statusCode: 200, statusMessage: "Success", data: message };
        });
        await messageBusHost.handle(registerModule, { publicHost, publicPort, privateHost, privatePort });
    }
};