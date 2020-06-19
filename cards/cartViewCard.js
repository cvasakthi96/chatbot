function shoppingCart(response) {
  var total = 0;
  const transformedResponse = response.map((element) => {
    const name = element.name || 'NA';
    const cost = element.cost || 'NA';
    const quantity = element.quantity || 'NA';
    total = total + (cost * quantity);
    const temp = {
      type: 'ColumnSet',
      spacing: 'Medium',
      columns: [
        {
          type: 'Column',
          items: [
            {
              type: 'TextBlock',
              text: name,
              isSubtle: true,
              color: "Accent",
              weight: "Lighter",
            }
          ],
          width: 'stretch'
        },
        {
          type: 'Column',
          items: [
            {
              type: 'TextBlock',
              horizontalAlignment: 'left',
              text: quantity.toString(),
              isSubtle: true,
              weight: "Lighter",

            }
          ],
          width: 'stretch'
        },
        {
          type: 'Column',
          items: [
            {
              type: 'TextBlock',
              horizontalAlignment: 'Right',
              text: `Rs ${cost.toString()}`,
              isSubtle: true,
              weight: "Lighter",

            }
          ],
          width: 'stretch'
        }
      ]
    }
    return temp;
  })
  const totalCost = [{
    type: 'ColumnSet',
    spacing: 'Medium',
    columns: [

      {
        type: 'Column',
        items: [
          {
            type: 'TextBlock',
            horizontalAlignment: 'right',
            text: 'Total',
            isSubtle: true
          }
        ],
        width: 'stretch'
      },
      {
        type: 'Column',
        items: [
          {
            type: 'TextBlock',
            horizontalAlignment: 'Right',
            text: `Rs ${total.toString()}`,
            isSubtle: true
          }
        ],
        width: 'stretch'
      }
    ]
  }]
  const template = {
    type: 'AdaptiveCard',
    body: [
      {
        type: 'Container',
        style: 'good',
        bleed: true,
        items: [
          {
            type: 'TextBlock',
            wrap: true,
            text: 'Your Cart Items',
            fontType: 'Monospace',
            size: "Medium",
            spacing: "None"
          }
        ]
      },
      {
        type: 'ColumnSet',
        spacing: 'Medium',
        columns: [
          {
            type: 'Column',
            items: [
              {
                type: 'TextBlock',
                text: 'Item',
                isSubtle: true,
                color: "Good",
                size: "Default",
                fontType: "Default",
              }
            ]
          },
          {
            type: 'Column',
            items: [
              {
                type: 'TextBlock',
                horizontalAlignment: 'left',
                text: 'quantity',
                isSubtle: true,
                color: "Good",
                size: "Default",
                fontType: "Default",
              }
            ]
          },
          {
            type: 'Column',
            items: [
              {
                type: 'TextBlock',
                horizontalAlignment: 'Right',
                text: 'cost',
                isSubtle: true,
                color: "Good",
                size: "Default",
                fontType: "Default",
              }
            ]
          }
        ]
      }
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Proceed to checkout',
        data: {
          checkout: true
        }
      }
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.2'
  }
  transformedResponse.push.apply(transformedResponse, totalCost);
  template.body.push.apply(template.body, transformedResponse);
  return (template)
}
module.exports.shoppingCart = shoppingCart;
