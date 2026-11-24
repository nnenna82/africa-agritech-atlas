"use client";

// "Download as PDF": opens the device's print dialog, where "Save as PDF" is one of the choices.
// The print layout (no menus, buttons or bar; light colors) is set in globals.css under @media print.

export default function PrintButton({ label = "Download as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex min-h-11 items-center gap-2 rounded-md border border-accent px-4 text-sm font-medium text-fg"
    >
      <span aria-hidden="true">⤓</span> {label}
    </button>
  );
}
