import type { ReactElement } from 'react';
import { formatPercentage, formatRamUsage } from '../../utils/format';
import widgetStyles from '../../components/widgets/MetricWidget.module.css';

interface WidgetProps {
  value: number;
  secondaryValue?: number;
  total?: number;
}

interface MetricWidget {
  render(): ReactElement;
}

abstract class BaseMetricWidget implements MetricWidget {
  constructor(protected readonly props: WidgetProps) {}

  protected abstract getTitle(): string;
  protected abstract getPrimaryValue(): string;
  protected abstract getSubtitle(): string;

  render(): ReactElement {
    return (
      <article className={widgetStyles.widget}>
        <h3 className={widgetStyles.title}>{this.getTitle()}</h3>
        <p className={widgetStyles.value}>{this.getPrimaryValue()}</p>
        <p className={widgetStyles.subtitle}>{this.getSubtitle()}</p>
      </article>
    );
  }
}

class CpuWidget extends BaseMetricWidget {
  protected getTitle(): string {
    return 'CPU';
  }

  protected getPrimaryValue(): string {
    return formatPercentage(this.props.value);
  }

  protected getSubtitle(): string {
    return 'Uso actual';
  }
}

class RamWidget extends BaseMetricWidget {
  protected getTitle(): string {
    return 'RAM';
  }

  protected getPrimaryValue(): string {
    return formatRamUsage(this.props.value, this.props.total);
  }

  protected getSubtitle(): string {
    return this.props.total ? 'Memoria usada' : 'Memoria en uso';
  }
}

type WidgetType = 'cpu' | 'ram';

type FactoryMethod = (props: WidgetProps) => MetricWidget;

const registry: Record<WidgetType, FactoryMethod> = {
  cpu: (props) => new CpuWidget(props),
  ram: (props) => new RamWidget(props),
};

export class MetricWidgetFactory {
  static create(type: WidgetType, props: WidgetProps): MetricWidget {
    const factory = registry[type];
    if (!factory) {
      throw new Error(`Widget no soportado: ${type}`);
    }
    return factory(props);
  }
}
