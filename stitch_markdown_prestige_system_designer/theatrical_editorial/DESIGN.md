---
name: Theatrical Editorial
colors:
  surface: '#fff8f5'
  surface-dim: '#e2d8d3'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2ec'
  surface-container: '#f6ece6'
  surface-container-high: '#f0e6e1'
  surface-container-highest: '#ebe1db'
  on-surface: '#1f1b17'
  on-surface-variant: '#584140'
  inverse-surface: '#352f2c'
  inverse-on-surface: '#f9efe9'
  outline: '#8b7170'
  outline-variant: '#dfbfbe'
  surface-tint: '#ac3239'
  primary: '#6c0013'
  on-primary: '#ffffff'
  primary-container: '#8e1b26'
  on-primary-container: '#ff9e9d'
  inverse-primary: '#ffb3b1'
  secondary: '#9e3f44'
  on-secondary: '#ffffff'
  secondary-container: '#fd898b'
  on-secondary-container: '#752127'
  tertiary: '#3e3119'
  on-tertiary: '#ffffff'
  tertiary-container: '#56472e'
  on-tertiary-container: '#cab696'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#8b1824'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#ffb3b3'
  on-secondary-fixed: '#410009'
  on-secondary-fixed-variant: '#7f282e'
  tertiary-fixed: '#f6e0bd'
  tertiary-fixed-dim: '#d9c4a3'
  on-tertiary-fixed: '#251a05'
  on-tertiary-fixed-variant: '#53452c'
  background: '#fff8f5'
  on-background: '#1f1b17'
  surface-variant: '#ebe1db'
  curtain-red: '#8E1B26'
  curtain-hem: '#5E0F18'
  curtain-text: '#FFF7EC'
  bg-performance: '#F5EEE2'
  surface-performance: '#FFFBF3'
  bg-backstage: '#D9C4A3'
  surface-backstage: '#F4ECDD'
  ink: '#14100D'
  muted-ink: '#4F4338'
  sunken: '#EADFCB'
  line-control-edge: '#14100D'
  line-soft: '#CDBFA8'
  dark-curtain-red: '#C0303F'
  dark-curtain-hem: '#8E1B26'
  dark-bg-performance: '#14100D'
  dark-surface-performance: '#211A16'
  dark-bg-backstage: '#231A13'
  dark-surface-backstage: '#2E231A'
  dark-ink: '#F5EEE2'
  dark-muted-ink: '#C9B9A3'
  dark-sunken: '#0C0907'
  dark-line-soft: '#4A3C33'
typography:
  display-hero:
    fontFamily: Domine
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Domine
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Domine
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Domine
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Domine
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Domine
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Libre Franklin
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Libre Franklin
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Libre Franklin
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  mono-label:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  mono-meta:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-prompter:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.1em
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

# Prestige Design Tokens and System

## Brand & Aesthetics
Prestige is an editorial, structural, theatrical portfolio theme with two authored layers per project: Performance (the polished stage result, slab typography, cream Playbill feel) and Backstage (the behind-the-curtain process, corrugated cardboard, monospace shipping label feel).

## Colors
- Primary Accent / Curtain Red: #8E1B26 (Dark scheme: #C0303F)
- Curtain Hem / Deep Red: #5E0F18 (Dark scheme: #8E1B26)
- Text on Curtain: #FFF7EC
- Background (Performance / Playbill): #F5EEE2 (Dark: #14100D)
- Surface (Performance): #FFFBF3 (Dark: #211A16)
- Background (Backstage / Cardboard): #D9C4A3 (Dark: #231A13)
- Surface (Backstage): #F4ECDD (Dark: #2E231A)
- Ink / Foreground: #14100D (Dark: #F5EEE2)
- Muted Ink: #4F4338 (Dark: #C9B9A3)
- Sunken: #EADFCB (Dark: #0C0907)
- Line / Control Edge: #14100D (Dark: #F5EEE2)
- Line Soft: #CDBFA8 (Dark: #4A3C33)

## Typography
- Display / Vaudeville Slab: "Alfa Slab One", serif (fallback: Rockwell, Georgia, serif)
- Process / Shipping Label / Monospace: "IBM Plex Mono", ui-monospace, monospace
- Body / Reading: "Libre Franklin", system-ui, sans-serif

## Layout & Components
- Sticky 48px Curtain Red Valance with dual-segment toggle: (●) Performance | ( ) Backstage
- Split Stage homepage layout (Front of Curtain · Results vs Behind the Curtain · Process)
- Pleated curtain drape with 12px hem and toggle mechanic
- Barcode project ref strips (SHA-256 derived visual bars + duration, team, stack, metric)
- Hazard-striped Trapdoor failure reporting strips and cards (TD-001)
- Structured Backstage step breakdown (Problem, Constraints, Hypotheses, Rejected, Implementation, Result)
