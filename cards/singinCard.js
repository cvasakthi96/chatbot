function singinCard(response) {

  return ({
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.2",
    "type": "AdaptiveCard",
    "body": [
      {
        "type": "Container",
        "style": "emphasis",
        "bleed": true,
        "items": [
          {
            "type": "TextBlock",
            "wrap": true,
            "text": "Member Login",
            "fontType": "Monospace",
            "color": "Accent"

          }
        ]
      }
    ],
    "actions": [
      {
        "type": "Action.Submit",
        "title": "Login",
        "data": {
          "signInClicked": true
        }

      }
    ]
  }
  )
}
module.exports.singinCard = singinCard;
