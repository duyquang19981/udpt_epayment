const partnerCode = 'MOMOFXF120200430';
const accessKey = 'eZbOjvZUs4KmLzzb';
const serectkey = 'wSWBmpf52GtRiEIpv1YhE2IMQTNEx0ME';
const returnUrl = process.env.URL_CALLBACK || 'http://localhost:3000/comfirm';
const notifyurl =  process.env.URL_CALLBACK || 'http://localhost:3000/comfirm';
const requestType = "captureMoMoWallet";
const extraData = "key=test1";

module.exports =  {
    partnerCode,
    accessKey,
    serectkey,
    returnUrl,
    notifyurl,
    requestType,
    extraData
}