const dotEnv = require('dotenv')

dotEnv.config();

const {
    Client,
    PrivateKey,
    AccountId,
    AccountInfoQuery
} = require('@hashgraph/sdk')


let client;

if (process.env.HEDERA_NETWORK != null) {
    switch (process.env.HEDERA_NETWORK) {
        case "previewnet":
            client = Client.forPreviewnet();
            break;
        case "mainnet":
            client = Client.forMainnet();
            client.setMirrorNetwork("mainnet-public.mirrornode.hedera.com:443")           
            break;
        default:
            client = Client.forTestnet();
    }
} else {
    try {
        // client = await Client.fromConfigFile(process.env.CONFIG_FILE);
        client = Client.forTestnet();
    } catch (err) {
        client = Client.forTestnet();
    }
}


    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

    client.setOperator(operatorId, operatorKey);





module.exports = {
    client,
    operatorKey,
    operatorId
}
