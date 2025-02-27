import { EmptyContent } from "components/EmptyContent";
import KeyValueItemList, { KeyValueItem } from "components/KeyValueItemList";
import LinkPlusButton from "components/LinkPlusButton";
import { changeValueAction, multiChangeAction } from "openblocks-core";
import { StringControl } from "comps/controls/codeControl";
import CompNameControl from "comps/controls/compNameControl";
import { dropdownControl } from "comps/controls/dropdownControl";
import { EditorContext } from "comps/editorState";
import { list } from "comps/generators/list";
import { Section } from "openblocks-design";
import { BluePlusIcon } from "openblocks-design";
import { useContext } from "react";
import InputListItemComp, { getInputOptionLabel, InputTypeEnum } from "./inputListItemComp";
import { trans } from "i18n";

const InputListCompBase = list(InputListItemComp);

class InputListComp extends InputListCompBase {
  handleAdd(name: string) {
    this.dispatch(
      this.pushAction({
        name,
        description: "",
      })
    );
  }

  handleDelete(idx: number) {
    this.dispatch(this.deleteAction(idx));
  }

  handleChangeType(idx: number, type: InputTypeEnum) {
    const item = this.getView()[idx];
    item.dispatch(
      multiChangeAction({
        defaultValue: changeValueAction({ compType: type }),
        test: changeValueAction({ compType: type }),
        type: changeValueAction(type),
      })
    );
  }

  getPropertyView() {
    const children = this.getView();
    return (
      <PropertyView
        onAdd={(name) => this.handleAdd(name)}
        onDelete={(i) => this.handleDelete(i)}
        onTypeChange={(i, type) => this.handleChangeType(i, type)}
        items={children}
      />
    );
  }

  getTestView() {
    const children = this.getView();
    const fields = children.map((i: any) => i.getTestView());
    return (
      <Section name={trans("moduleContainer.inputTest")}>
        {fields.length > 0 ? fields : <EmptyContent text={trans("module.emptyTestInput")} />}
      </Section>
    );
  }
}

export default InputListComp;

interface PropertyViewProps {
  onAdd: (name: string) => void;
  onDelete: (idx: number) => void;
  onTypeChange: (idx: number, type: InputTypeEnum) => void;
  items: InstanceType<typeof InputListItemComp>[];
}

function PropertyView(props: PropertyViewProps) {
  const { onDelete, onTypeChange, onAdd, items } = props;
  const editorState = useContext(EditorContext);

  const handleAdd = () => {
    const name = editorState.getNameGenerator().genItemName("moduleInput");
    onAdd(name);
  };

  return (
    <div>
      <KeyValueItemList
        title={trans("module.input")}
        keyTitle={trans("module.name")}
        valueTitle={trans("prop.type")}
        extra={
          <LinkPlusButton icon={<BluePlusIcon />} onClick={handleAdd}>
            {trans("addItem")}
          </LinkPlusButton>
        }
        emptyText={trans("module.emptyInput")}
        onEmptyClick={handleAdd}
      >
        {items.map((i, idx) => (
          <InputItem
            key={idx}
            {...i.children}
            onDelete={() => onDelete(idx)}
            onTypeChange={(value) => onTypeChange(idx, value as InputTypeEnum)}
          />
        ))}
      </KeyValueItemList>
    </div>
  );
}

interface InputItemProps {
  name: InstanceType<typeof CompNameControl>;
  defaultValue: any;
  // defaultValue: InstanceType<ReturnType<typeof withType>>;
  type: InstanceType<ReturnType<typeof dropdownControl>>;
  description: InstanceType<typeof StringControl>;
  onDelete: () => void;
  onTypeChange: (value: string) => void;
}

function InputItem(props: InputItemProps) {
  const { name, type, description, defaultValue, onDelete, onTypeChange } = props;

  const content = (
    <>
      {name.propertyView({ label: trans("module.name") })}
      {type.propertyView({
        label: trans("prop.type"),
        onChange: onTypeChange,
        disableDispatchValueChange: true,
      })}
      {type.getView() !== InputTypeEnum.Query &&
        defaultValue.children.comp.propertyView({ label: trans("prop.defaultValue") })}
      {description.propertyView({ label: trans("labelProp.tooltip") })}
    </>
  );

  const label = getInputOptionLabel(type.getView() as InputTypeEnum);
  const [cnLabel] = label.split(" ");
  return (
    <KeyValueItem
      del={onDelete}
      name={name.getView()}
      value={cnLabel}
      clickPopoverContent={content}
    />
  );
}
