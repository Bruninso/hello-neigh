const jwt = require("jsonwebtoken");
const SECRET = "HELLO_NEIGHBOR_SECRET";

function auth(requiredRole = null) {
    return (req, res, next) => {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ error: "Token não enviado" });
        }

        const token = header.split(" ")[1];

        try {
            const decoded = jwt.verify(token, SECRET);
            req.user = decoded;

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ error: "Acesso negado" });
            }

            next();
        } catch {
            return res.status(401).json({ error: "Token inválido" });
        }
    };
}

module.exports = auth;
