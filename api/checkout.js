const mercadopago = require('mercadopago');

// Configuramos Mercado Pago con tu llave secreta de Vercel
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
});

module.exports = async (req, res) => {
    // Solo aceptamos pedidos tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { items } = req.body;

        // Armamos la "Preferencia" (lo que MP le va a mostrar al cliente)
        let preference = {
            items: items.map(item => ({
                title: item.name,
                unit_price: Number(item.price),
                quantity: Number(item.qty),
                currency_id: 'ARS'
            })),
            // Estas son las páginas a las que vuelve el cliente tras pagar
            back_urls: {
                success: "https://demo-power-fitness.vercel.app/",
                failure: "https://demo-power-fitness.vercel.app/",
                pending: "https://demo-power-fitness.vercel.app/"
            },
            auto_return: "approved",
        };

        // Le pedimos a Mercado Pago que cree el link
        const response = await mercadopago.preferences.create(preference);

        // Le enviamos el link de pago (init_point) a tu script.js
        res.status(200).json({ init_point: response.body.init_point });

    } catch (error) {
        console.error("Error en MP:", error);
        res.status(500).json({ error: error.message });
    }
};