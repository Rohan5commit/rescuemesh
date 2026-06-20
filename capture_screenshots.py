#!/usr/bin/env python3
"""Capture screenshots of RescueMesh running app for README.

Usage:
  1. Start the app: npm run tauri dev
  2. Run this script: python3 capture_screenshots.py
  3. Screenshots saved to assets/screenshots/

Requires: pyautogui, Pillow
  pip install pyautogui Pillow
"""
import os
import time
import sys

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'screenshots')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

SCREENS = [
    ('dashboard', 'Case Dashboard', 3),
    ('intake', 'Intake Screen', 3),
    ('action-plan', 'Action Plan Screen', 3),
    ('ask', 'Ask RescueMesh', 3),
    ('evidence', 'Evidence Inspector', 3),
    ('p2p', 'P2P & Compute', 3),
    ('export', 'Export Screen', 3),
]

def capture_screenshots():
    try:
        import pyautogui
    except ImportError:
        print('Error: pyautogui not installed. Run: pip install pyautogui Pillow')
        sys.exit(1)

    print('Screenshots will be saved to:', SCREENSHOTS_DIR)
    print('Make sure the Tauri app is running and visible.')
    print('You have 5 seconds to switch to the app window...')
    time.sleep(5)

    for filename, label, delay in SCREENS:
        print(f'Capturing {label} in {delay}s...')
        time.sleep(delay)
        screenshot = pyautogui.screenshot()
        path = os.path.join(SCREENSHOTS_DIR, f'{filename}.png')
        screenshot.save(path)
        print(f'  Saved: {path}')

    print(f'\nDone! {len(SCREENS)} screenshots saved to {SCREENSHOTS_DIR}')
    print('Now update README.md to reference these images.')

if __name__ == '__main__':
    capture_screenshots()
