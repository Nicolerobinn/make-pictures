import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';
import html2canvas from 'html2canvas';
import styles from './index.scss';

const useGesture = createUseGesture([dragAction, pinchAction]);
export function getPhoto(callback: any) {
  let inputObj = document.getElementById('booheeChooseImage');
  if (!inputObj) {
    inputObj = document.createElement('input');
    inputObj.setAttribute('type', 'file');
    inputObj.setAttribute('id', 'booheeChooseImage');
    inputObj.setAttribute('accept', 'image/*');
    inputObj.setAttribute(
      'style',
      'position: fixed; top: -4000px; left: -3000px; z-index: -300;'
    );
    document.body.appendChild(inputObj);
  }
  inputObj.click();
  inputObj.onchange = (e: any) => {
    const image = e.target.files[0];
    callback(window.URL.createObjectURL(image));
  };
}
export function getCanvas(dom: any) {
  html2canvas(dom, {
    useCORS: true
  }).then(canvas => {
    const photoBase64Source = canvas.toDataURL().split('base64,')[1];
    document.body.appendChild(canvas);
  });
}

export default function Dashboard() {
  const [photoSource, changePhotoSource] = useState<string>('');
  const [photoStyle, changePhotoStyle] = useState<any>({});
  const [springPhotoOrien, setSpringPhotoOrien] = useState<any>({
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: 0
  });
  const [style, api] = useSpring(() => springPhotoOrien);
  useEffect(() => {
    const handler = (e: any) => e.preventDefault();
    document.addEventListener('gesturestart', handler);
    document.addEventListener('gesturechange', handler);
    document.addEventListener('gestureend', handler);
    photodLoad(
      'https://onetest.boohee.cn/status/2022/02/16/1e619cac-1044-40c5-922c-8e3a33899733'
    );
    return () => {
      document.removeEventListener('gesturestart', handler);
      document.removeEventListener('gesturechange', handler);
      document.removeEventListener('gestureend', handler);
    };
  }, []);
  const ref: any = useRef(null);
  const canvasRef: any = useRef(null);
  useGesture(
    {
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) return cancel();
        api.start({ x, y });
      },
      onPinch: ({
        origin: [ox, oy],
        first,
        movement: [ms],
        offset: [s, a],
        memo
      }) => {
        if (first) {
          const { width, height, x, y } = ref.current.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [style.x.get(), style.y.get(), tx, ty];
        }

        const x = memo[0] - (ms - 1) * memo[2];
        const y = memo[1] - (ms - 1) * memo[3];
        api.start({ scale: s, rotateZ: a, x, y });
        return memo;
      }
    },
    {
      target: ref,
      drag: {
        from: () => [style.x.get(), style.y.get()]
      },
      pinch: {
        from: () => [style.scale.get(), style.rotateZ.get()],
        scaleBounds: { min: 0.05, max: 9 },
        rubberband: true
      }
    }
  );
  useEffect(() => {
    reset();
  }, [photoSource]);
  const setSomePhotoData = (url: string, img: any) => {
    changePhotoSource(url);
    changePhotoStyle({
      width: img.width,
      height: img.height
    });
    // setSpringPhotoOrien()
    // 通过图片的宽高来计算图片展示的位置
  };
  const photodLoad = (url: string) => {
    const img = new Image();
    img.src = url;
    if (img.complete) {
      setSomePhotoData(url, img);
    } else {
      img.onload = () => {
        setSomePhotoData(url, img);
        img.onload = null;
      };
    }
  };
  const reset = () => {
    api.start(springPhotoOrien);
  };
  return (
    <div
      style={{
        display: 'flex'
      }}>
      <div className={styles.container}>
        <div className={'flex fill center'} ref={canvasRef}>
          {photoSource && (
            <animated.div
              className={styles.card}
              ref={ref}
              style={{
                ...style,
                ...photoStyle,
                background: `url(${photoSource})`
              }}></animated.div>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          height: '100px',
          justifyContent: 'space-around'
        }}>
        <button
          onClick={() => {
            getCanvas(canvasRef.current);
          }}>
          Get Canvas
        </button>
        <button
          onClick={() => {
            getPhoto(photodLoad);
          }}>
          select picture
        </button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}
