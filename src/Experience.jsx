import { lazy, Suspense, useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import SceneErrorBoundary from './components/SceneErrorBoundary.jsx'

const PhoenixScene = lazy(() => import('./components/PhoenixScene.jsx'))

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
  const reducedMotion = useReducedMotion()
  const [motionEnabled, setMotionEnabled] = useState(true)
  const modelMoves = motionEnabled && !reducedMotion

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const restart = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <div className="experience">
      <a className="skip-link" href="#story">Skip to the story</a>

      <div className="atmosphere" aria-hidden="true" />
      <div className="atmosphere-shade" aria-hidden="true" />

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
            <h1 id="hero-title">Rise<br /><span>again.</span></h1>
            <p className="hero__intro">A phoenix does not survive the fire. It becomes something the fire cannot keep.</p>
            <button className="primary-action" type="button" onClick={() => goTo('story')}>
              Enter the myth
            </button>
          </div>
        </section>

        <section className="chapter chapter--right" id="story" aria-labelledby="spark-title">
          <div className="chapter__copy">
            <h2 id="spark-title">Every ending keeps a spark.</h2>
            <p>Not a memory. Not a promise. Just enough heat to choose what comes next.</p>
          </div>
        </section>

        <section className="chapter chapter--left" aria-labelledby="form-title">
          <div className="chapter__copy chapter__copy--wide">
            <h2 id="form-title">Burn the shape they gave you.</h2>
            <p>Rebirth is not a return to the old form. It is permission to arrive without it.</p>
          </div>
        </section>

        <section className="chapter chapter--manifesto" aria-labelledby="return-title">
          <h2 id="return-title">What returns is never the same.</h2>
        </section>

        <section className="chapter chapter--final">
          <div className="finale">
            <h2>Again is a direction.</h2>
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
