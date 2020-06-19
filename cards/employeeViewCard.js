function EmpCard(response) {  
  return ({
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.2",
    "backgroundColor":'white',
    "body": [
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "items": [
              {
                "type": "Image",
                "style": "Person",
                "url": 'https://picsum.photos/200',
                "size": "Small",
                "height": '55px',
                "weight":'55px'
              }
            ],
            "width": "auto"
          },
          {
            "type": "Column",
            "items": [
              {
                "type": "TextBlock",
                "weight": "Bolder",
                "text": response.title,
                "wrap": true
              },
              {
                "type": "TextBlock",
                "spacing": "None",
                "text": response.doj,
                "isSubtle": true,
                "wrap": true
              }
            ],
            "width": "stretch"
          }
        ]
      },
      {
        "type": "FactSet",
        "facts": [
          {
            "title": 'email',
            "value": response.facts.email
          },
          {
            "title": 'phone',
            "value": response.facts.phone
          },
          {
            "title": 'name',
            "value": response.facts.name
          },
          {
            "title": 'website',
            "value": response.facts.website
          }
        ],
        "spacing": "Large",
        "height": "stretch"
      }
    ]
  }
  )
}
module.exports.EmpCard = EmpCard;
