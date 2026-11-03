import "server-only";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import {
  budgetOptions,
  delayOptions,
  labelOf,
  requestTypes,
  type ContactData,
} from "./contact-schema";

/*
 * Envoi des e-mails du formulaire de contact.
 * - RESEND_API_KEY défini : envoi réel via Resend (notification + accusé de réception).
 * - Sinon : mode démo, la demande est seulement écrite dans la console du serveur.
 */

export type SendResult = { demo: boolean };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function summaryLines(data: ContactData) {
  return [
    ["Nom", data.name],
    ["E-mail", data.email],
    ["Téléphone", data.phone || "—"],
    ["Type de demande", labelOf(requestTypes, data.requestType)],
    ["Offre consultée", data.service || "—"],
    ["Budget indicatif", labelOf(budgetOptions, data.budget)],
    ["Délai souhaité", labelOf(delayOptions, data.delay)],
  ] as const;
}

export function buildNotificationEmail(data: ContactData) {
  const lines = summaryLines(data);
  const text = `${lines.map(([label, value]) => `${label} : ${value}`).join("\n")}\n\nMessage :\n${data.message}`;
  const html = `<h2>Nouvelle demande de contact</h2>
<table cellpadding="6" style="border-collapse:collapse">${lines
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="color:#4b5563">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table>
<h3>Message</h3><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`;
  return {
    subject: `[${siteConfig.name}] ${labelOf(requestTypes, data.requestType)} — ${data.name}`,
    text,
    html,
  };
}

export function buildAcknowledgementEmail(data: ContactData) {
  const text = `Bonjour ${data.name},

Merci pour votre message ! Nous l'avons bien reçu et nous vous répondrons ${siteConfig.contact.responseTime}.

Pour rappel, votre demande : ${labelOf(requestTypes, data.requestType)}.

À très bientôt,
L'équipe ${siteConfig.name}`;
  const html = `<p>Bonjour ${escapeHtml(data.name)},</p>
<p>Merci pour votre message ! Nous l'avons bien reçu et nous vous répondrons ${escapeHtml(siteConfig.contact.responseTime)}.</p>
<p>Pour rappel, votre demande : <strong>${escapeHtml(labelOf(requestTypes, data.requestType))}</strong>.</p>
<p>À très bientôt,<br>L'équipe ${escapeHtml(siteConfig.name)}</p>`;
  return { subject: `Nous avons bien reçu votre message — ${siteConfig.name}`, text, html };
}

export async function sendContactEmails(data: ContactData): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || siteConfig.contact.email;
  // Expéditeur : doit appartenir à un domaine vérifié dans Resend.
  // Par défaut, l'adresse de test de Resend (n'envoie qu'au propriétaire du compte).
  const from = process.env.RESEND_FROM_EMAIL || `${siteConfig.name} <onboarding@resend.dev>`;

  if (!apiKey) {
    console.info(
      `[contact] Mode démo (RESEND_API_KEY absent) — demande reçue :\n${buildNotificationEmail(data).text}`,
    );
    return { demo: true };
  }

  const resend = new Resend(apiKey);
  const notification = buildNotificationEmail(data);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject: notification.subject,
    text: notification.text,
    html: notification.html,
  });
  if (error) throw new Error(`Resend : ${error.message}`);

  // L'accusé de réception ne doit pas faire échouer la demande principale.
  const ack = buildAcknowledgementEmail(data);
  const ackResult = await resend.emails.send({
    from,
    to: data.email,
    subject: ack.subject,
    text: ack.text,
    html: ack.html,
  });
  if (ackResult.error) {
    console.warn(`[contact] Accusé de réception non envoyé : ${ackResult.error.message}`);
  }

  return { demo: false };
}
