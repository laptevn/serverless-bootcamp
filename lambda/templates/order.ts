export const orderTemplate = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '    <meta charset="UTF-8">\n' +
    '    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '    <title>Order Confirmation</title>\n' +
    '    <style>\n' +
    '        body {\n' +
    '            font-family: Arial, sans-serif;\n' +
    '            margin: 0;\n' +
    '            padding: 20px;\n' +
    '        }\n' +
    '        .container {\n' +
    '            max-width: 600px;\n' +
    '            margin: auto;\n' +
    '            border: 1px solid #ddd;\n' +
    '            padding: 20px;\n' +
    '            border-radius: 8px;\n' +
    '            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n' +
    '        }\n' +
    '        .header {\n' +
    '            font-size: 24px;\n' +
    '            margin-bottom: 20px;\n' +
    '        }\n' +
    '        .details {\n' +
    '            margin-bottom: 10px;\n' +
    '        }\n' +
    '        .footer {\n' +
    '            font-size: 12px;\n' +
    '            color: #888;\n' +
    '            margin-top: 20px;\n' +
    '        }\n' +
    '    </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '<div class="container">\n' +
    '    <div class="header">\n' +
    '        Thank You for Your Order!\n' +
    '    </div>\n' +
    '    <div class="details">\n' +
    '        <strong>Order ID:</strong> {{id}}<br>\n' +
    '        <strong>Email:</strong> {{customer}}<br>\n' +
    '        <strong>Shipping Address:</strong> {{address}}<br>\n' +
    '        <strong>Order Details:</strong>\n' +
    '        <ul>\n' +
    '            <!-- Use Handlebars\' #each helper to loop through order details -->\n' +
    '            {{#each details}}\n' +
    '            <li>{{this.product}} - Quantity: {{this.quantity}}</li>\n' +
    '            {{/each}}\n' +
    '        </ul>\n' +
    '        <strong>Total Amount:</strong> {{total_amount}}\n' +
    '    </div>\n' +
    '    <div class="footer">\n' +
    '        If you have any questions or need further information, please contact our customer service at support@onlineshop.com.\n' +
    '    </div>\n' +
    '</div>\n' +
    '</body>\n' +
    '</html>\n'
