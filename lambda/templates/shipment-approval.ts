export const shipmentApprovalTemplate = 'Dear Store Owner,\n' +
    '\n' +
    'A new order with ID {{ orderId }} has been placed by {{ customer }}.\n' +
    '\n' +
    'To approve the shipment, click the link below:\n' +
    '{{ approvalLambdaUrl }}?orderId={{orderId}}&taskToken={{taskToken}}&result=approve\n' +
    '\n' +
    'To reject the shipment, click the link below:\n' +
    '{{ approvalLambdaUrl }}?orderId={{orderId}}&taskToken={{taskToken}}&result=reject\n' +
    '\n' +
    'Thank you,\n' +
    'Online Shop'
