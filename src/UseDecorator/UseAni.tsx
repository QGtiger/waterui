import { AniFactory, setStyles } from "@lightfish/tools";
import React, { createRef } from "react";
import { AniModalConfig, ReactComponent } from "../types";

type UseAniType = AniModalConfig & {
  autoAni?: boolean,
  autoDelayAni?: number
};

/**
 * 动画装饰器
 */
export function UseAni(common: UseAniType) {
  return function (Comp: ReactComponent) {
    return class extends React.Component<{
      getAniIns: (ins: AniFactory) => any;
    }> {
      aniCont = createRef<HTMLDivElement>();
      aniFactory: AniFactory;
      constructor(props: any) {
        super(props);
      }

      componentDidMount() {

        const { aniConfig, showAniConfig, closeAniConfig, autoDelayAni = 0, autoAni = true } = common;
        this.aniFactory = new AniFactory(
          this.aniCont.current,
          showAniConfig || aniConfig,
          closeAniConfig || aniConfig,
        );

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

      render() {
        const { getAniIns, ...otherProps } = this.props
        return (
          <div ref={this.aniCont} className="useAni-cont">
            <Comp {...otherProps} />
          </div>
        );
      }
    };
  };
}