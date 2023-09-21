export const reportTemplate = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '    <meta charset="UTF-8">\n' +
    '    <title>Daily Order Report</title>\n' +
    '    <style>\n' +
    '        table {\n' +
    '            width: 100%;\n' +
    '            border-collapse: collapse;\n' +
    '            margin: 20px 0;\n' +
    '        }\n' +
    '        th, td {\n' +
    '            border: 1px solid #ddd;\n' +
    '            padding: 8px;\n' +
    '            text-align: left;\n' +
    '        }\n' +
    '        th {\n' +
    '            background-color: #f2f2f2;\n' +
    '        }\n' +
    '    </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '    <h1>Daily Order Report</h1>\n' +
    '    <h3>Date: {{currentDate}}</h3>\n' +
    '\n' +
    '    <table>\n' +
    '        <thead>\n' +
    '            <tr>\n' +
    '                <th>Email</th>\n' +
    '                <th>Shipping Address</th>\n' +
    '                <th>Product</th>\n' +
    '                <th>Quantity</th>\n' +
    '                <th>Price (Per Item)</th>\n' +
    '                <th>Total Price</th>\n' +
    '            </tr>\n' +
    '        </thead>\n' +
    '        <tbody>\n' +
    '            {{#each orders}}\n' +
    '            <tr>\n' +
    '                <td>{{this.email}}</td>\n' +
    '                <td>{{this.address}}</td>\n' +
    '                <td>{{this.product}}</td>\n' +
    '                <td>{{this.quantity}}</td>\n' +
    '                <td>${{this.pricePerItem}}</td>\n' +
    '                <td>${{this.totalPrice}}</td>\n' +
    '            </tr>\n' +
    '            {{/each}}\n' +
    '        </tbody>\n' +
    '    </table>\n' +
    '\n' +
    '    <p><strong>Total Price for All Orders: ${{grandTotal}}</strong></p>\n' +
    '</body>\n' +
    '</html>'
