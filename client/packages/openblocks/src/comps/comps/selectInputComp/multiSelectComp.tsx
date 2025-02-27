import { styleControl } from "comps/controls/styleControl";
import { MultiSelectStyle } from "comps/controls/styleControlConstants";
import { trans } from "i18n";
import { arrayStringExposingStateControl } from "../../controls/codeStateControl";
import { UICompBuilder } from "../../generators";
import { CommonNameConfig, NameConfig, withExposingConfigs } from "../../generators/withExposing";
import { SelectChildrenMap, SelectPropertyView, SelectUIView } from "./selectCompConstants";
import { SelectInputInvalidConfig, selectInputValidate } from "./selectInputConstants";

export const MultiSelectBasicComp = (function () {
  const childrenMap = {
    ...SelectChildrenMap,
    value: arrayStringExposingStateControl("value", ["1", "2"]),
    style: styleControl(MultiSelectStyle),
  };
  return new UICompBuilder(childrenMap, (props, dispatch) => {
    const valueSet = new Set<any>(props.options.map((o) => o.value)); // Filter illegal default values entered by the user
    return props.label({
      required: props.required,
      style: props.style,
      children: (
        <SelectUIView
          {...props}
          mode={"multiple"}
          value={props.value.value.filter?.((v) => valueSet.has(v))}
          onChange={(value) => {
            props.value.onChange(value);
            props.onEvent("change");
          }}
          dispatch={dispatch}
        />
      ),
      ...selectInputValidate(props),
    });
  })
    .setPropertyViewFn((children) => <SelectPropertyView {...children} />)
    .build();
})();

export const MultiSelectComp = withExposingConfigs(MultiSelectBasicComp, [
  new NameConfig("value", trans("selectInput.valueDesc")),
  new NameConfig("inputValue", trans("select.inputValueDesc")),
  SelectInputInvalidConfig,
  ...CommonNameConfig,
]);
