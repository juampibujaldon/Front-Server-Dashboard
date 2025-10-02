import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MetricWidgetFactory } from '../domain/factories/MetricWidgetFactory';

describe('MetricWidgetFactory', () => {
  it('crea un widget de CPU que muestra porcentaje redondeado', () => {
    const widget = MetricWidgetFactory.create('cpu', { value: 72.4 });
    render(widget.render());

    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('crea un widget de RAM que formatea el uso', () => {
    const widget = MetricWidgetFactory.create('ram', { value: 8, total: 16 });
    render(widget.render());

    expect(screen.getByText('RAM')).toBeInTheDocument();
    expect(screen.getByText('8.0 GB / 16.0 GB')).toBeInTheDocument();
  });
});
