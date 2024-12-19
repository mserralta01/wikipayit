declare module '@sendgrid/mail' {
  interface MailDataRequired {
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
  }

  interface ResponseData {
    statusCode: number;
    body: any;
    headers: Record<string, string>;
  }

  const mail: {
    setApiKey(apiKey: string): void;
    send(data: MailDataRequired): Promise<[ResponseData]>;
    send(data: MailDataRequired[]): Promise<[ResponseData]>;
  };

  export { MailDataRequired, ResponseData };
  export default mail;
} 