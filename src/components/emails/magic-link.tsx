import { Body, Button, Container, Head, Html, Preview, Section, Text } from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
  name?: string;
  expiresInMinutes?: number;
}

export function MagicLinkEmail({ url, name, expiresInMinutes = 5 }: MagicLinkEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Click the link to sign in to matchadrop.fyi</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={brandText}>
              <span style={prompt}>❯ </span>
              matchadrop.fyi
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>Let's get you signed in</Text>

            <Text style={paragraph}>{greeting}</Text>

            <Text style={paragraph}>
              Click the button below to sign in to your account. This link will expire in {expiresInMinutes} minutes for
              security reasons.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={url}>
                Sign in to matchadrop.fyi
              </Button>
            </Section>

            <Text style={paragraph}>Or copy and paste this URL into your browser:</Text>

            <Text style={linkText}>{url}</Text>

            <Text style={footerText}>If you didn't request this email, you can safely ignore it.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles matching the app's sprout theme
const main = {
  backgroundColor: "#F9F8F6",
  fontFamily: '"Geist Mono", ui-monospace, "SF Mono", monospace',
  padding: "40px 20px",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #D4D9C9",
  borderRadius: "10px",
  maxWidth: "480px",
  margin: "0 auto",
  padding: "40px 32px",
};

const logoSection = {
  marginBottom: "32px",
  borderBottom: "1px solid #E8EBE3",
  paddingBottom: "24px",
};

const brandText = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#3D3D3D",
  margin: "0",
};

const prompt = {
  color: "#8FAF6E",
};

const contentSection = {
  padding: "8px 0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#3D3D3D",
  margin: "0 0 24px 0",
  lineHeight: "1.3",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#5A5A5A",
  margin: "0 0 20px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#8FAF6E",
  color: "#1A2A10",
  fontSize: "15px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

const linkText = {
  fontSize: "13px",
  color: "#8FAF6E",
  wordBreak: "break-all" as const,
  margin: "0 0 32px 0",
  padding: "12px 16px",
  backgroundColor: "#F4F6F1",
  borderRadius: "6px",
  fontFamily: '"Geist Mono", ui-monospace, monospace',
};

const footerText = {
  fontSize: "13px",
  color: "#8A8A8A",
  margin: "32px 0 0 0",
  paddingTop: "24px",
  borderTop: "1px solid #E8EBE3",
};

export default MagicLinkEmail;
