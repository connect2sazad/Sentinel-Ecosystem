const mailConfig = {
    host:
        process.env.MAIL_HOST ||
        null,

    port:
        Number(
            process.env.MAIL_PORT ||
            587
        ),

    secure:
        String(
            process.env.MAIL_SECURE ||
            "false"
        ).toLowerCase() ===
        "true",

    username:
        process.env.MAIL_USERNAME ||
        null,

    password:
        process.env.MAIL_PASSWORD ||
        null,

    fromName:
        process.env.MAIL_FROM_NAME ||
        "Sentinel",

    fromAddress:
        process.env.MAIL_FROM_ADDRESS ||
        "no-reply@sentinel.local"
};

export default mailConfig;