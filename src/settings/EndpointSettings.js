const config = {
    debug: true,
    //apiLocation: 'http://192.168.1.2/pi_api/',
    apiLocation: 'http://[fdfd:df:5b67:f00:235c:49cb:3bd0:587b]/pi_api/', // DN42 address, for Dank, accessible only from that network.
    octoPrintLocation: 'http://10.0.1.3/',
    octoPrintApiKey: '4E1A5A1DAFCF49BAA6A7814036FE6B06',
    maxRows: 40,
    color: '254,254,254',
    dataLabels: ['0h', '', '', '', '1h', '', '', '', '2h', '', '', '', '3h'],
};

export default config;