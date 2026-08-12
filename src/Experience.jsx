import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SceneErrorBoundary from './components/SceneErrorBoundary.jsx'

const PhoenixScene = lazy(() => import('./components/PhoenixScene.jsx'))

gsap.registerPlugin(useGSAP, ScrollTrigger)

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

function LoadingScreen() {
  const { active, progress } = useProgress()

  return (
    <div className={`loader ${active ? 'loader--visible' : ''}`} aria-live="polite" aria-busy={active}>
      <div className="loader__mark" aria-hidden="true">R</div>
      <div className="loader__status">
        <span>Gathering fire</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="loader__track" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  )
}

export default function Experience() {
  const experienceRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const { active, progress } = useProgress()
  const [motionEnabled, setMotionEnabled] = useState(true)
  const modelMoves = motionEnabled && !reducedMotion
  const experienceReady = !active && progress === 100

  useGSAP(() => {
    const ignition = '.ignition'
    const animatedElements = [
      '.site-header',
      '.hero .eyebrow',
      '.hero__line > span',
      '.hero__intro',
      '.hero .primary-action',
    ]

    if (reducedMotion) {
      gsap.set(ignition, { display: 'none' })
      gsap.set(animatedElements, { clearProps: 'all' })
      return
    }

    if (!experienceReady) return

    const opening = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: () => gsap.set(ignition, { display: 'none' }),
    })

    opening
      .set(ignition, { display: 'block' })
      .set('.site-header', { autoAlpha: 0, y: -18 })
      .set('.hero .eyebrow, .hero__intro, .hero .primary-action', { autoAlpha: 0, y: 24 })
      .set('.hero__line > span', { yPercent: 112, rotation: 2 })
      .fromTo('.ignition__core-line', { scaleY: 0 }, { scaleY: 1, duration: 0.58, ease: 'power3.inOut' })
      .to('.ignition__panel--left', { xPercent: -101, duration: 1.12, ease: 'power4.inOut' }, 0.42)
      .to('.ignition__panel--right', { xPercent: 101, duration: 1.12, ease: 'power4.inOut' }, 0.42)
      .to('.ignition__core', { autoAlpha: 0, scale: 1.08, duration: 0.35 }, 0.62)
      .to('.site-header', { autoAlpha: 1, y: 0, duration: 0.68 }, 0.82)
      .to('.hero__line > span', { yPercent: 0, rotation: 0, duration: 0.92, stagger: 0.1 }, 0.76)
      .to('.hero .eyebrow, .hero__intro, .hero .primary-action', {
        autoAlpha: 1,
        y: 0,
        duration: 0.68,
        stagger: 0.08,
      }, 0.94)

    gsap.fromTo('.scroll-progress__fill', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
      },
    })

    gsap.fromTo('.atmosphere', { scale: 1.02 }, {
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: 'main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    })

    gsap.from('.chapter--right .heading-line > span', {
      yPercent: 108,
      rotation: 2,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: '.chapter--right',
        start: 'top 58%',
        toggleActions: 'play none none reverse',
      },
    })

    gsap.from('.chapter--right .chapter__copy > p', {
      autoAlpha: 0,
      x: 42,
      duration: 0.72,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.chapter--right .chapter__copy',
        start: 'top 52%',
        toggleActions: 'play none none reverse',
      },
    })

    const burnTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.chapter--left',
        start: 'top 62%',
        toggleActions: 'play none none reverse',
      },
    })
    burnTimeline
      .from('.chapter--left .heading-line > span', {
        autoAlpha: 0,
        x: -72,
        skewX: 7,
        duration: 0.78,
        stagger: 0.09,
        ease: 'power4.out',
      })
      .from('.chapter--left .chapter__copy > p', {
        autoAlpha: 0,
        y: 26,
        duration: 0.62,
        ease: 'power3.out',
      }, '-=0.42')

    const finaleTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.chapter--final',
        start: 'top 58%',
        toggleActions: 'play none none reverse',
      },
    })
    finaleTimeline
      .from('.finale .heading-line > span', {
        autoAlpha: 0,
        yPercent: 95,
        scale: 1.16,
        duration: 0.88,
        stagger: 0.1,
        ease: 'power4.out',
      })
      .from('.finale .primary-action', {
        autoAlpha: 0,
        y: 24,
        duration: 0.58,
        ease: 'power3.out',
      }, '-=0.35')

    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      const manifesto = gsap.timeline({
        scrollTrigger: {
          trigger: '.chapter--manifesto',
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
      manifesto
        .from('.manifesto__word', {
          autoAlpha: 0,
          xPercent: (index) => (index % 2 === 0 ? -42 : 42),
          yPercent: (index) => (index % 3 - 1) * 32,
          rotation: (index) => (index % 2 === 0 ? -4 : 4),
          stagger: 0.06,
          ease: 'power2.out',
        })
        .to('.manifesto__word', {
          color: '#f1e9e2',
          WebkitTextStrokeColor: 'rgba(241, 233, 226, 0)',
          stagger: 0.04,
          ease: 'none',
        }, 0.35)
        .to('.manifesto__word', {
          scale: 1.06,
          stagger: { each: 0.03, from: 'center' },
          ease: 'power1.inOut',
        }, 0.55)
    })

    const magneticTargets = gsap.utils.toArray('.primary-action')
    const cleanups = magneticTargets.map((button) => {
      const xTo = gsap.quickTo(button, 'x', { duration: 0.38, ease: 'power3.out' })
      const yTo = gsap.quickTo(button, 'y', { duration: 0.38, ease: 'power3.out' })
      const onMove = (event) => {
        const bounds = button.getBoundingClientRect()
        xTo((event.clientX - bounds.left - bounds.width / 2) * 0.12)
        yTo((event.clientY - bounds.top - bounds.height / 2) * 0.16)
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }
      button.addEventListener('pointermove', onMove)
      button.addEventListener('pointerleave', onLeave)
      return () => {
        button.removeEventListener('pointermove', onMove)
        button.removeEventListener('pointerleave', onLeave)
      }
    })

    ScrollTrigger.refresh()
    return () => {
      cleanups.forEach((cleanup) => cleanup())
      mm.revert()
    }
  }, {
    scope: experienceRef,
    dependencies: [experienceReady, reducedMotion],
    revertOnUpdate: true,
  })

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const restart = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <div className="experience" ref={experienceRef}>
      <a className="skip-link" href="#story">Skip to the story</a>

      <div className="atmosphere" aria-hidden="true" />
      <div className="atmosphere-shade" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true"><span className="scroll-progress__fill" /></div>

      <div className="ignition" aria-hidden="true">
        <div className="ignition__panel ignition__panel--left" />
        <div className="ignition__panel ignition__panel--right" />
        <div className="ignition__core">
          <span className="ignition__core-line" />
          <strong>Rise from ash</strong>
        </div>
      </div>

      <SceneErrorBoundary>
        <Suspense fallback={null}>
          <PhoenixScene animate={modelMoves} reducedMotion={reducedMotion} />
        </Suspense>
      </SceneErrorBoundary>
      <LoadingScreen />

      <header className="site-header">
        <button className="wordmark" type="button" onClick={restart} aria-label="Return to the beginning">
          R<span>/</span>ISE
        </button>

        <nav aria-label="Primary navigation">
          <button type="button" onClick={() => goTo('story')}>Myth</button>
          <a href="#credits">Credits</a>
          <button
            className="motion-toggle"
            type="button"
            aria-pressed={modelMoves}
            onClick={() => setMotionEnabled((current) => !current)}
          >
            Motion <span>{modelMoves ? 'on' : 'off'}</span>
          </button>
        </nav>
      </header>

      <main>
        <section className="hero chapter" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">An interactive myth</p>
            <h1 id="hero-title">
              <span className="hero__line"><span>Rise</span></span>
              <span className="hero__line hero__line--outline"><span>again.</span></span>
            </h1>
            <p className="hero__intro">A phoenix does not survive the fire. It becomes something the fire cannot keep.</p>
            <button className="primary-action" type="button" onClick={() => goTo('story')}>
              Enter the myth
            </button>
          </div>
        </section>

        <section className="chapter chapter--right" id="story" aria-labelledby="spark-title">
          <div className="chapter__copy">
            <h2 id="spark-title">
              <span className="heading-line"><span>Every ending</span></span>
              <span className="heading-line"><span>keeps a spark.</span></span>
            </h2>
            <p>Not a memory. Not a promise. Just enough heat to choose what comes next.</p>
          </div>
        </section>

        <section className="chapter chapter--left" aria-labelledby="form-title">
          <div className="chapter__copy chapter__copy--wide">
            <h2 id="form-title">
              <span className="heading-line"><span>Burn the shape</span></span>
              <span className="heading-line"><span>they gave you.</span></span>
            </h2>
            <p>Rebirth is not a return to the old form. It is permission to arrive without it.</p>
          </div>
        </section>

        <section className="chapter chapter--manifesto" aria-labelledby="return-title">
          <h2 id="return-title">
            {['What', 'returns', 'is', 'never', 'the', 'same.'].map((word) => (
              <span className="manifesto__word" key={word}>{word}</span>
            ))}
          </h2>
        </section>

        <section className="chapter chapter--final">
          <div className="finale">
            <h2>
              <span className="heading-line"><span>Again is a</span></span>
              <span className="heading-line"><span>direction.</span></span>
            </h2>
            <button className="primary-action" type="button" onClick={restart}>Rise again</button>
          </div>
        </section>
      </main>

      <footer id="credits">
        <p>Phoenix Bird by <a href="https://sketchfab.com/norberto3d" target="_blank" rel="noreferrer">NORBERTO-3D</a></p>
        <p><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> / Built as a WebGL experiment</p>
      </footer>
    </div>
  )
}
