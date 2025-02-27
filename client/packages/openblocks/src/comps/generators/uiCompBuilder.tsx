import { BoolCodeControl } from "comps/controls/codeControl";
import React, { ReactNode, useContext } from "react";
import { ExternalEditorContext } from "util/context/ExternalEditorContext";
import { Comp, CompParams, MultiBaseComp } from "openblocks-core";
import {
  childrenToProps,
  parseChildrenFromValueAndChildrenMap,
  PropertyView,
  PropertyViewFnTypeForComp,
  ToConstructor,
  ToDataType,
  ToNodeType,
  ViewFnTypeForComp,
} from "./multi";

export type NewChildren<ChildrenCompMap extends Record<string, Comp<unknown>>> = ChildrenCompMap & {
  hidden: InstanceType<typeof BoolCodeControl>;
};

export function HidableView(props: { children: JSX.Element | React.ReactNode; hidden: boolean }) {
  const { readOnly } = useContext(ExternalEditorContext);
  if (readOnly) {
    return <>{!props.hidden && props.children}</>;
  } else {
    return (
      <>
        {props.hidden ? (
          <div style={{ opacity: "50%", width: "100%", height: "100%" }}>{props.children}</div>
        ) : (
          <>{props.children}</>
        )}
      </>
    );
  }
}

export function uiChildren<ChildrenCompMap extends Record<string, Comp<unknown>>>(
  childrenMap: ToConstructor<ChildrenCompMap>
): ToConstructor<NewChildren<ChildrenCompMap>> {
  return { ...childrenMap, hidden: BoolCodeControl } as any;
}

type ViewReturn = ReactNode;
/**
 * UI components can be constructed with this class, providing the hidden interface
 */
export class UICompBuilder<ChildrenCompMap extends Record<string, Comp<unknown>>> {
  private childrenMap: ToConstructor<ChildrenCompMap>;
  private viewFn: ViewFnTypeForComp<ViewReturn, NewChildren<ChildrenCompMap>>;
  private propertyViewFn: PropertyViewFnTypeForComp<NewChildren<ChildrenCompMap>> = () => null;

  /**
   * If viewFn is not placed in the constructor, the type of ViewReturn cannot be inferred
   */
  constructor(
    childrenMap: ToConstructor<ChildrenCompMap>,
    viewFn: ViewFnTypeForComp<ViewReturn, NewChildren<ChildrenCompMap>>
  ) {
    this.childrenMap = childrenMap;
    this.viewFn = viewFn;
  }

  setPropertyViewFn(propertyViewFn: PropertyViewFnTypeForComp<NewChildren<ChildrenCompMap>>) {
    this.propertyViewFn = propertyViewFn;
    return this;
  }

  build() {
    if (this.childrenMap.hasOwnProperty("hidden")) {
      throw new Error("already has hidden");
    }
    const newChildrenMap = uiChildren(this.childrenMap);
    const builder = this;

    class MultiTempComp extends MultiBaseComp<
      NewChildren<ChildrenCompMap>,
      ToDataType<NewChildren<ChildrenCompMap>>,
      ToNodeType<NewChildren<ChildrenCompMap>>
    > {
      override parseChildrenFromValue(
        params: CompParams<ToDataType<NewChildren<ChildrenCompMap>>>
      ): NewChildren<ChildrenCompMap> {
        return parseChildrenFromValueAndChildrenMap(params, newChildrenMap);
      }

      override getView(): ViewReturn {
        return <UIView comp={this} viewFn={builder.viewFn} />;
      }

      override getPropertyView(): ReactNode {
        return <PropertyView comp={this} propertyViewFn={builder.propertyViewFn} />;
      }
    }
    return MultiTempComp;
  }
}

/**
 * Guaranteed to be in a react component, so that react hooks can be used internally
 */
function UIView(props: { comp: any; viewFn: any }) {
  const comp = props.comp;
  const childrenProps = childrenToProps(comp.children);
  return (
    <HidableView hidden={childrenProps.hidden as boolean}>
      {props.viewFn(childrenProps, comp.dispatch)}
    </HidableView>
  );
}
