import { AniFactory, setStyles } from "@lightfish/tools";
import React, { createRef } from "react";
import { isReactClassComponent } from "../../src/Module/Utils/utils";
import { AniModalConfig, ReactComponent } from "../types";

type UseAniType = AniModalConfig & {
  autoAni?: boolean,
  autoDelayAni?: number
};

function useAniDidEnd(effect: Function, diff){
  if (diff.onAniDidEnd) {
    diff.onAniDidEnd(effect)
  }
}

/**
 * 动画装饰器
 */
export function UseAni(common: UseAniType) {
  return function (Comp: ReactComponent) {
    return class extends React.Component<{
      getAniIns: (ins: AniFactory) => any;
      autoPlay?: boolean
      delay?: number
    }> {
      aniCont = createRef<HTMLDivElement>();
      aniFactory: AniFactory;
      CompRef = null

      constructor(props: any) {
        super(props);
      }

      componentDidMount() {
        common.autoAni = this.props.autoPlay === undefined ? common.autoAni : this.props.autoPlay
        common.autoDelayAni = this.props.delay
        const { aniConfig, showAniConfig, closeAniConfig, autoDelayAni = 0, autoAni = true } = common;
        this.aniFactory = new AniFactory(
          this.aniCont.current,
          showAniConfig || aniConfig,
          closeAniConfig || aniConfig,
        );

        this.aniFactory.onceEventListener('showed', this.onAniShowed, this)

        typeof this.props.getAniIns === 'function' && this.props.getAniIns(this.aniFactory);

        if (autoAni) {
          if (autoDelayAni === 0) {
            this.aniFactory.showAni()
          } else {
            setTimeout(() => {
              this.aniFactory.showAni();
            }, autoDelayAni)
          }
        }
      }

      onAniShowed() {
        if (this.CompRef) {
          this.CompRef.componentDidAniEnd && this.CompRef.componentDidAniEnd()
        }
      }

      render() {
        const { getAniIns, ...otherProps } = this.props
        const isClassComp = isReactClassComponent(Comp)
        return (
          <div ref={this.aniCont} className="useAni-cont">
            {
              isClassComp ? (
                <Comp {...otherProps} ref={
                  el => this.CompRef = el
                } />
              ) : (
                <Comp {...otherProps}/>
              )
            }
          </div>
        );
      }
    };
  };
}