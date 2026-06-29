/**
 * The page's HTML template structure, using JSX.
 */
import { Meta, Title, Links, Main, Scripts } from 'ice';
import { description } from '../package.json';
import { ConfigProvider } from 'antd';

export default function Document() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="data-spm" content="a263az" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* Ant Design 5 reset CSS */}
        {/* <link rel="stylesheet" href="https://unpkg.com/antd@5/dist/reset.css" /> */}
        <Meta />
        <Title />
        <Links />
      </head>
      <body>
        <ConfigProvider>
          <Main />
        </ConfigProvider>
        <Scripts />
      </body>
    </html>
  );
}
