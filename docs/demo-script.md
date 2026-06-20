# RescueMesh Demo Script (2-4 minutes)

## Opening (30 seconds)

"RescueMesh is a fully on-device AI copilot for emergency response teams. It runs entirely on your laptop — no cloud, no internet required. Let me show you how it works."

## Step 1: Create Incident Case (20 seconds)

"I'll start by creating a new incident case. Let's say we have a fire reported in Building 3."

- Click "New Case" → Enter title → Create
- "The app is now ready to receive field data."

## Step 2: Add Multimodal Inputs (40 seconds)

"I'll add what our field team has reported:"

- Add a text note: "Smoke visible from second floor. Two people on third floor balcony. No fire trucks yet."
- Click Voice Note to simulate a transcribed voice report
- Add an image (pre-loaded demo image)
- "All inputs are stored locally on this device. Nothing leaves the machine."

## Step 3: Run Assessment (30 seconds)

"Now I'll run the AI assessment. This uses QVAC's local LLM — it's running right here on my laptop."

- Click "Run Assessment & Generate Action Plan"
- "The AI has classified this as a fire incident, high severity, with specific hazards identified."
- Show assessment results: category, severity, key hazards, time sensitivity

## Step 4: Review Action Plan (30 seconds)

"Here's the generated action plan with immediate priorities, safety warnings, and required equipment."

- Show safety warnings (red cards)
- Show prioritized checklist items
- Toggle a checklist item as complete
- "Every recommendation is grounded in our local knowledge packs — fire safety SOPs, first response guides."

## Step 5: Ask Follow-up Questions (30 seconds)

"I can ask follow-up questions. Let me ask 'What should I do first?'"

- Click Ask RescueMesh → Type question → Show response
- Point out the evidence sources at the bottom
- "Notice it cites specific sections from our knowledge packs. This is the local RAG system at work."

## Step 6: Evidence Inspector (20 seconds)

"The Evidence Inspector shows exactly where each recommendation comes from — which document, which excerpt, and the confidence score."

- Navigate to Evidence tab
- Show knowledge pack evidence vs case input evidence

## Step 7: P2P & Delegated Compute (30 seconds)

"RescueMesh can also discover nearby devices and share knowledge packs peer-to-peer."

- Scan for peers → Show discovered devices
- Select a peer → Share a knowledge pack
- "This uses the Holepunch stack — direct device-to-device, no server."
- Demonstrate delegated compute: offload a summarization task to a peer

## Step 8: Export (15 seconds)

"Finally, I can export a clean incident report, action checklist, or handoff note — all generated locally."

- Show Export tab → Preview report → Download

## Closing (15 seconds)

"RescueMesh proves that local-first AI is production-ready. Every inference, every search, every recommendation happens on this device. In disaster scenarios where connectivity fails, this is the kind of tool that saves lives."
