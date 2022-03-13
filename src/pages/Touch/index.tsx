// @ts-nocheck
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import html2canvas from 'html2canvas';

import styles from './index.scss';
export default function Touch() {
  const ref = React.useRef();
  const canvasRef: any = React.useRef(null);
  useEffect(() => {
    // 获取dom
    const image: any = document.getElementById('IMG');
    const log: any = document.querySelector('.log');
    // 全局变量
    let result,
      x,
      y,
      scale = 1,
      maxScale,
      minScale = 0.1;
    // 图片加载完成后再操作，否则naturalWidth为0
    image.addEventListener('load', () => {
      result = getImgSize(
        image.naturalWidth,
        image.naturalHeight,
        window.innerWidth,
        window.innerHeight
      );
      x = (window.innerWidth - result.width) * 0.5;
      y = 0;
      image.style.transform =
        'translate3d(' + x + 'px, ' + y + 'px, 0) scale(1)';
      maxScale = Math.max(Math.round(image.naturalWidth / result.width), 3);
      log.innerHTML = `x = ${x.toFixed(0)}<br>y = ${y.toFixed(
        0
      )}<br>scale = ${scale.toFixed(5)}`;
    });
    image.src =
      'https://onetest.boohee.cn/status/2022/02/16/1e619cac-1044-40c5-922c-8e3a33899733';

    /**
     * 获取图片缩放尺寸
     * @param {number} naturalWidth
     * @param {number} naturalHeight
     * @param {number} maxWidth
     * @param {number} maxHeight
     * @returns
     */
    function getImgSize(naturalWidth, naturalHeight, maxWidth, maxHeight) {
      const imgRatio = naturalWidth / naturalHeight;
      const maxRatio = maxWidth / maxHeight;
      let width, height;
      // 如果图片实际宽高比例 >= 显示宽高比例
      if (imgRatio >= maxRatio) {
        if (naturalWidth > maxWidth) {
          width = maxWidth;
          height = (maxWidth / naturalWidth) * naturalHeight;
        } else {
          width = naturalWidth;
          height = naturalHeight;
        }
      } else {
        if (naturalHeight > maxHeight) {
          width = (maxHeight / naturalHeight) * naturalWidth;
          height = maxHeight;
        } else {
          width = naturalWidth;
          height = naturalHeight;
        }
      }
      return { width: width, height: height };
    }

    // 全局变量
    let isPointerdown: any = false, // 按下标识
      pointers: any = [], // 触摸点数组
      point1: any = { x: 0, y: 0 }, // 第一个点坐标
      point2: any = { x: 0, y: 0 }, // 第二个点坐标
      diff: any = { x: 0, y: 0 }, // 相对于上一次pointermove移动差值
      lastPointermove: any = { x: 0, y: 0 }, // 用于计算diff
      lastPoint1: any = { x: 0, y: 0 }, // 上一次第一个触摸点坐标
      lastPoint2: any = { x: 0, y: 0 }, // 上一次第二个触摸点坐标
      lastCenter: any; // 上一次中心点坐标
    // 绑定 pointerdown
    image.addEventListener('pointerdown', e => {
      pointers.push(e);
      point1 = { x: pointers[0].clientX, y: pointers[0].clientY };
      if (pointers.length === 1) {
        isPointerdown = true;
        image.setPointerCapture(e.pointerId);
        lastPointermove = { x: pointers[0].clientX, y: pointers[0].clientY };
      } else if (pointers.length === 2) {
        point2 = { x: pointers[1].clientX, y: pointers[1].clientY };
        lastPoint2 = { x: pointers[1].clientX, y: pointers[1].clientY };
        lastCenter = getCenter(point1, point2);
      }
      lastPoint1 = { x: pointers[0].clientX, y: pointers[0].clientY };
    });
    // 绑定 pointermove
    image.addEventListener('pointermove', e => {
      if (isPointerdown) {
        handlePointers(e, 'update');
        const current1 = { x: pointers[0].clientX, y: pointers[0].clientY };
        if (pointers.length === 1) {
          diff.x = current1.x - lastPointermove.x;
          diff.y = current1.y - lastPointermove.y;
          lastPointermove = { x: current1.x, y: current1.y };
          x += diff.x;
          y += diff.y;
          image.style.transform =
            'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
          log.innerHTML = `x = ${x.toFixed(0)}<br>y = ${y.toFixed(
            0
          )}<br>scale = ${scale.toFixed(5)}`;
        } else if (pointers.length === 2) {
          const current2 = { x: pointers[1].clientX, y: pointers[1].clientY };
          // 计算相对于上一次移动距离比例 ratio > 1放大，ratio < 1缩小
          let ratio =
            getDistance(current1, current2) /
            getDistance(lastPoint1, lastPoint2);
          // 缩放比例
          const _scale = scale * ratio;
          if (_scale > maxScale) {
            scale = maxScale;
            ratio = maxScale / scale;
          } else if (_scale < minScale) {
            scale = minScale;
            ratio = minScale / scale;
          } else {
            scale = _scale;
          }
          // 计算当前双指中心点坐标
          const center = getCenter(current1, current2);
          // 计算图片中心偏移量，默认transform-origin: 50% 50%
          // 如果transform-origin: 0% 0%，那origin.x = (ratio - 1) * result.width * 0
          // origin.y = (ratio - 1) * result.height * 0
          // 如果transform-origin: 30% 40%，那origin.x = (ratio - 1) * result.width * 0.3
          // origin.y = (ratio - 1) * result.height * 0.4
          const origin: {
            x: any;
            y: any;
          } = {
            x: (ratio - 1) * result.width * 0.5,
            y: (ratio - 1) * result.height * 0.5
          };
          // 计算偏移量
          x -=
            (ratio - 1) * (center.x - x) - origin.x - (center.x - lastCenter.x);
          y -=
            (ratio - 1) * (center.y - y) - origin.y - (center.y - lastCenter.y);
          image.style.transform =
            'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
          lastCenter = { x: center.x, y: center.y };
          lastPoint1 = { x: current1.x, y: current1.y };
          lastPoint2 = { x: current2.x, y: current2.y };
          log.innerHTML = `x = ${x.toFixed(0)}<br>y = ${y.toFixed(0)}<br>
                  scale = ${scale.toFixed(5)}<br>
                  centerX = ${center.x.toFixed(
                    0
  )}<br>centerY = ${center.y.toFixed(0)}<br>`;
        }
      }
      e.preventDefault();
    });
    // 绑定 pointerup
    image.addEventListener('pointerup', e => {
      if (isPointerdown) {
        handlePointers(e, 'delete');
        if (pointers.length === 0) {
          isPointerdown = false;
        } else if (pointers.length === 1) {
          point1 = { x: pointers[0].clientX, y: pointers[0].clientY };
          lastPointermove = { x: pointers[0].clientX, y: pointers[0].clientY };
        }
      }
    });
    // 绑定 pointercancel
    image.addEventListener('pointercancel', e => {
      if (isPointerdown) {
        isPointerdown = false;
        pointers.length = 0;
      }
    });

    /**
     * 更新或删除指针
     * @param {PointerEvent} e
     * @param {string} type
     */
    function handlePointers(e, type) {
      for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId === e.pointerId) {
          if (type === 'update') {
            pointers[i] = e;
          } else if (type === 'delete') {
            pointers.splice(i, 1);
          }
        }
      }
    }

    /**
     * 获取两点间距离
     * @param {object} a 第一个点坐标
     * @param {object} b 第二个点坐标
     * @returns
     */
    function getDistance(a, b) {
      const x = a.x - b.x;
      const y = a.y - b.y;
      return Math.hypot(x, y); // Math.sqrt(x * x + y * y);
    }
    /**
     * 获取中点坐标
     * @param {object} a 第一个点坐标
     * @param {object} b 第二个点坐标
     * @returns
     */
    function getCenter(a, b) {
      const x = (a.x + b.x) / 2;
      const y = (a.y + b.y) / 2;
      return { x: x, y: y };
    }
  }, []);
  const getCanvas = () => {
    html2canvas(canvasRef.current, {
      useCORS: true
    }).then(canvas => {
      document.body.appendChild(canvas);
    });
  };
  return (
    <div>
      <div style={{ fontSize: '30px', color: '#f99' }}>two</div>
      <div className={styles.container} ref={canvasRef}>
        <img id="IMG" className={styles.card} ref={ref}></img>
      </div>
      <div className="log"></div>
      <div>
        <button onClick={getCanvas}>Get Canvas</button>
      </div>
    </div>
  );
}
