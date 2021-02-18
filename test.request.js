const request = require("component.request");
module.exports = async (newHost, path, data, deferredrequestid = 0) => {
    return await request.send({
        host: newHost.host,
        port: newHost.port,
        path,
        method: "POST",
        headers: { 
            username: "marchuanv",
            fromhost: "bob",
            fromport: 999,
            deferredrequestid
        }, 
        data,
        retryCount: 1
    });
    
};