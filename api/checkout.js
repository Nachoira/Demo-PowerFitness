const { MercadoPagoConfig, Preference } = require('mercadopago');

// Esta es la conexión segura con tu cuenta de MP
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

module.exports = async (req, res) => {
  // Solo aceptamos peticiones de compra (POST)
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  try {
    const { items } = req.body; // Aquí llega tu array 'cart' desde el JS

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name,
          unit_price: Number(item.price),
          quantity: Number(item.qty),
          currency_id: 'ARS'
        })),
        back_urls: {
          // Después del pago, vuelve a tu web
          success: `https://${req.headers.host}`, 
          failure: `https://${req.headers.host}`,
        },
        auto_return: "approved",
      }
    });

    // Le devolvemos a tu web el link de pago generado
    res.status(200).json({ init_point: result.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el pago" });
  }
};