import fetch from 'node-fetch'
import mjml2html from 'mjml'
import { getByQuery } from '../../utils/database'


const handler = async (req, res) => {
  const { intro, fromDate, toDate } = JSON.parse(req.body)
  const query = {
    sponsored: { $ne: true },
    created_at: { $lte: toDate, $gte: fromDate }
  };
  const data = await getByQuery({ query })

  let markdown = `<mjml>
    <mj-head>
      <mj-attributes>
        <mj-text font-size="16px" font-family="helvetica" />
        <mj-button font-family="helvetica" />
      </mj-attributes>
      <mj-style>
        a {
          color: #017a8c;
        }
      </mj-style>
    </mj-head>
    <mj-body>
      <mj-hero mode="fixed-height" height="300px" background-width="600px" background-height="300px" background-url="https://webdev.town/email-header.png" background-color="#2a3448" padding="120px 0px 0px">
        <mj-text align="center" color="#fff">
          <h2>${new Date(fromDate).toLocaleDateString("en-US")} - ${new Date(toDate).toLocaleDateString("en-US")}</h2>
        </mj-text>
      </mj-hero>
      <mj-section>
        <mj-column>
          <mj-text>Here's the summary of this weeks <a href="https://webdev.town">WebDev Town</a> resources.</mj-text>
          <mj-text>${intro}</mj-text>
        </mj-column>
      </mj-section>
      `
      for (let i = 0; i < data.length; i = i+2) {
        const item = data[i]
        const item2 = data[i+1]

        const baseUrl = process.env.S3_CDN
        const image1 = `${baseUrl}/${item.image.replace('/weekly/content/', '')}`
        const image2 = item2 && `${baseUrl}/${item2.image.replace('/weekly/content/', '')}`

        markdown= `${markdown}
        <mj-section>
          <mj-column>
            <mj-image src="${image1}" href="${item.link}" fluid-on-mobile="true" border="1px solid #BDBDBD" />
            <mj-text>
              ${item.sponsored ? '<p style="margin: 0; color: #616161">Sponsored</p>' : ''}
              <h2 style="margin-top:5px;"><a href="${item.link}" style="color: #000; text-decoration: none;">${item.title}</a></h2>
              <p>${item.description}</p>
              <a href="${item.link}">Visit!</a>
            </mj-text>
            <mj-spacer height="20px" />
            <mj-divider border-width="1px" border-color="lightgrey" />
            <mj-spacer height="40px" />
          </mj-column>
          ${item2
            ? `<mj-column>
            <mj-image src="${image2}" href="${item2.link}" fluid-on-mobile="true" border="1px solid #BDBDBD" />
            <mj-text>
              ${item2.sponsored ? '<p style="margin: 0; color: #616161">Sponsored</p>' : ''}
              <h2 style="margin-top:5px;"><a href="${item2.link}" style="color: #000; text-decoration: none;">${item2.title}</a></h2>
              <p>${item2.description}</p>
              <a href="${item2.link}">Visit!</a>
            </mj-text>
            <mj-spacer height="20px" />
            <mj-divider border-width="1px" border-color="lightgrey" />
          </mj-column>`
            : '<mj-column> </mj-column>'}
        </mj-section>`
      }

      markdown = `${markdown}
        <mj-section>
          <mj-column>
            <mj-text>You can support this newsletter by</mj-text>
            <mj-text>💸 booking a <a href="https://webdev.town/sponsorship/">sponsored post</a></mj-text>
            <mj-text>☕️ donating via <a href="https://ko-fi.com/wweb_dev">Ko-Fi</a></mj-text>
            <mj-text>🚀 helping me grow by sharing it with your friends and colleagues</mj-text>
            <mj-text></mj-text>
            <mj-text line-height="0">Cheers,</mj-text>
            <mj-text line-height="0">Vincent from <a href="https://webdev.town">WebDev Town</a></mj-text>
          </mj-column>
        </mj-section>
        <mj-section>
          <mj-column>
            <mj-text align="center">
            <a href="{$unsubscribe}">Unsubscribe</a><span> | </span><a href="{$url}">View in browser</a><span> | </span><a href="{$forward}">Forward</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>`

  const htmlOutput = mjml2html(markdown)

  res.status(200).json({ result: htmlOutput.html })
}

export default handler
